import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Loading from "@/components/Loading";
import { useAuthStore } from "@/stores/authStore";
import { AppointmentService } from "@/services/appointmentService";
import type { Appointment, Clinic } from "@/types";

type PeriodPreset = "month" | "last_month" | "year" | "last12" | "custom";

const toYmdLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getPresetRange = (
  preset: PeriodPreset,
  customFrom: string,
  customTo: string,
): { from: string; to: string } => {
  const now = new Date();
  if (preset === "custom" && customFrom && customTo) {
    return customFrom <= customTo
      ? { from: customFrom, to: customTo }
      : { from: customTo, to: customFrom };
  }
  if (preset === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toYmdLocal(from), to: toYmdLocal(to) };
  }
  if (preset === "last_month") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: toYmdLocal(from), to: toYmdLocal(to) };
  }
  if (preset === "year") {
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31);
    return { from: toYmdLocal(from), to: toYmdLocal(to) };
  }
  if (preset === "last12") {
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    return { from: toYmdLocal(from), to: toYmdLocal(to) };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toYmdLocal(from), to: toYmdLocal(to) };
};

const addDaysYmd = (ymd: string, delta: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toYmdLocal(dt);
};

const daysInclusiveYmd = (from: string, to: string) => {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const a = new Date(fy, fm - 1, fd).getTime();
  const b = new Date(ty, tm - 1, td).getTime();
  return Math.round((b - a) / 86400000) + 1;
};

const previousPeriodYmd = (from: string, to: string) => {
  const n = daysInclusiveYmd(from, to);
  const prevTo = addDaysYmd(from, -1);
  const prevFrom = addDaysYmd(prevTo, -(n - 1));
  return { from: prevFrom, to: prevTo };
};

const enumerateMonths = (fromYmd: string, toYmd: string) => {
  const [fy, fm] = fromYmd.split("-").map(Number);
  const [ty, tm] = toYmd.split("-").map(Number);
  const out: { key: string; label: string }[] = [];
  let y = fy;
  let m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
    out.push({ key, label: label.replace(".", "") });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
};

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const sumByStatusInRange = (
  apps: Appointment[],
  from: string,
  to: string,
  statuses: Appointment["status"][],
) =>
  apps
    .filter(
      (a) =>
        a.date >= from &&
        a.date <= to &&
        statuses.includes(a.status),
    )
    .reduce((s, a) => s + (a.value || 0), 0);

const countByStatusInRange = (
  apps: Appointment[],
  from: string,
  to: string,
  statuses: Appointment["status"][],
) =>
  apps.filter(
    (a) =>
      a.date >= from &&
      a.date <= to &&
      statuses.includes(a.status),
  ).length;

const formatDeltaPct = (current: number, previous: number) => {
  if (previous === 0 && current === 0) return "—";
  if (previous === 0) return "s/ período anterior";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
};

const FinanceiroDashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [preset, setPreset] = useState<PeriodPreset>("month");
  const monthRange = getPresetRange("month", "", "");
  const [customFrom, setCustomFrom] = useState(monthRange.from);
  const [customTo, setCustomTo] = useState(monthRange.to);
  const [comparePrevious, setComparePrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ownerAppointments, setOwnerAppointments] = useState<Appointment[]>(
    [],
  );
  const [clinicTitles, setClinicTitles] = useState<Record<string, string>>({});

  const canAccess =
    user?.userType === "company" &&
    (user?.planEmpresa === "basic" || user?.planEmpresa === "pro");

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    if (!canAccess) {
      router.replace("/painel-de-controle");
    }
  }, [isAuthenticated, user?.id, canAccess, router]);

  const loadData = useCallback(async () => {
    if (!user?.id || !canAccess) return;
    setLoading(true);
    try {
      const { clinicUtils } = await import("@/services/clinicService");
      const [clinicResult, aptResult] = await Promise.all([
        clinicUtils.getClinicsByUser(user.id),
        AppointmentService.getAllUserAppointments(user.id),
      ]);
      const clinics = clinicResult.clinics || [];
      const ids = new Set(
        clinics
          .map((c) => c.id)
          .filter((id): id is string => typeof id === "string"),
      );
      const titles: Record<string, string> = {};
      clinics.forEach((c: Clinic) => {
        if (c.id) titles[c.id] = c.title;
      });
      setClinicTitles(titles);
      const all = aptResult.data || [];
      setOwnerAppointments(all.filter((a) => ids.has(a.clinic_id)));
    } catch {
      setOwnerAppointments([]);
      setClinicTitles({});
    } finally {
      setLoading(false);
    }
  }, [user?.id, canAccess]);

  useEffect(() => {
    if (canAccess && user?.id) loadData();
  }, [canAccess, user?.id, loadData]);

  const range = useMemo(
    () => getPresetRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  const prevRange = useMemo(
    () => previousPeriodYmd(range.from, range.to),
    [range.from, range.to],
  );

  const metrics = useMemo(() => {
    const received = sumByStatusInRange(
      ownerAppointments,
      range.from,
      range.to,
      ["completed"],
    );
    const pending = sumByStatusInRange(
      ownerAppointments,
      range.from,
      range.to,
      ["pending", "confirmed"],
    );
    const completedCount = countByStatusInRange(
      ownerAppointments,
      range.from,
      range.to,
      ["completed"],
    );
    const avgTicket =
      completedCount > 0 ? received / completedCount : 0;
    const prevReceived = sumByStatusInRange(
      ownerAppointments,
      prevRange.from,
      prevRange.to,
      ["completed"],
    );
    const prevPending = sumByStatusInRange(
      ownerAppointments,
      prevRange.from,
      prevRange.to,
      ["pending", "confirmed"],
    );
    return {
      received,
      pending,
      completedCount,
      avgTicket,
      prevReceived,
      prevPending,
    };
  }, [ownerAppointments, range.from, range.to, prevRange.from, prevRange.to]);

  const monthBuckets = useMemo(() => {
    const months = enumerateMonths(range.from, range.to);
    const map = new Map<string, number>();
    months.forEach((m) => map.set(m.key, 0));
    ownerAppointments.forEach((a) => {
      if (a.status !== "completed") return;
      if (a.date < range.from || a.date > range.to) return;
      const key = a.date.slice(0, 7);
      if (map.has(key)) map.set(key, (map.get(key) || 0) + (a.value || 0));
    });
    return months.map((m) => ({
      label: m.label,
      value: map.get(m.key) || 0,
    }));
  }, [ownerAppointments, range.from, range.to]);

  const maxMonthValue = useMemo(
    () => Math.max(...monthBuckets.map((b) => b.value), 1),
    [monthBuckets],
  );

  const clinicRanking = useMemo(() => {
    const map = new Map<
      string,
      { completed: number; pending: number; count: number }
    >();
    ownerAppointments.forEach((a) => {
      if (a.date < range.from || a.date > range.to) return;
      const cur = map.get(a.clinic_id) || {
        completed: 0,
        pending: 0,
        count: 0,
      };
      if (a.status === "completed") {
        cur.completed += a.value || 0;
        cur.count += 1;
      } else if (a.status === "pending" || a.status === "confirmed") {
        cur.pending += a.value || 0;
      }
      map.set(a.clinic_id, cur);
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({
        id,
        title: clinicTitles[id] || "Espaço",
        ...v,
      }))
      .sort((a, b) => b.completed - a.completed);
  }, [ownerAppointments, range.from, range.to, clinicTitles]);

  const statusInRange = useMemo(
    () => ({
      completed: countByStatusInRange(
        ownerAppointments,
        range.from,
        range.to,
        ["completed"],
      ),
      pending: countByStatusInRange(
        ownerAppointments,
        range.from,
        range.to,
        ["pending"],
      ),
      confirmed: countByStatusInRange(
        ownerAppointments,
        range.from,
        range.to,
        ["confirmed"],
      ),
      cancelled: countByStatusInRange(
        ownerAppointments,
        range.from,
        range.to,
        ["cancelled"],
      ),
    }),
    [ownerAppointments, range.from, range.to],
  );

  const presetOptions = [
    { value: "month", label: "Este mês" },
    { value: "last_month", label: "Mês anterior" },
    { value: "year", label: "Este ano" },
    { value: "last12", label: "Últimos 12 meses" },
    { value: "custom", label: "Personalizado (de — até)" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="mb-4 text-gray-700">Faça login para ver o dashboard.</p>
          <Link
            href="/entrar"
            className="font-semibold text-[#2b9af3] hover:underline"
          >
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="flex justify-center py-24">
          <Loading message="Redirecionando..." />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Financeiro — Painel | Sublease</title>
        <meta
          name="description"
          content="Indicadores e faturamento dos seus espaços"
        />
      </Head>
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/painel-de-controle"
                className="mb-3 inline-block text-sm text-[#2b9af3] hover:underline"
              >
                ← Painel de controle
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Visão financeira
              </h1>
              <p className="mt-2 text-gray-600">
                Resumo dos valores dos agendamentos nos seus espaços.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white shadow-lg md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-green-100">Recebido no período</p>
                <p className="text-2xl font-bold md:text-3xl">
                  {loading
                    ? "…"
                    : formatCurrency(metrics.received)}
                </p>
                {comparePrevious && !loading && (
                  <p className="mt-1 text-xs text-green-100/90">
                    Período anterior: {formatCurrency(metrics.prevReceived)} (
                    {formatDeltaPct(metrics.received, metrics.prevReceived)})
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1 text-sm text-green-100">
                  A receber no período
                </p>
                <p className="text-2xl font-bold md:text-3xl">
                  {loading ? "…" : formatCurrency(metrics.pending)}
                </p>
                {comparePrevious && !loading && (
                  <p className="mt-1 text-xs text-green-100/90">
                    Período anterior: {formatCurrency(metrics.prevPending)} (
                    {formatDeltaPct(metrics.pending, metrics.prevPending)})
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1 text-sm text-green-100">Ticket médio</p>
                <p className="text-2xl font-bold md:text-3xl">
                  {loading
                    ? "…"
                    : formatCurrency(metrics.avgTicket)}
                </p>
                <p className="mt-1 text-xs text-green-100/90">
                  Só agendamentos concluídos
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Período e comparação
            </h2>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
              <div className="min-w-[220px] flex-1">
                <Select
                  label="Intervalo"
                  options={presetOptions}
                  value={preset}
                  onChange={(v) => setPreset(v as PeriodPreset)}
                />
              </div>
              {preset === "custom" && (
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="De"
                    type="date"
                    value={customFrom}
                    onChange={setCustomFrom}
                  />
                  <Input
                    label="Até"
                    type="date"
                    value={customTo}
                    onChange={setCustomTo}
                  />
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Período ativo:{" "}
              <span className="font-medium text-gray-700">
                {range.from.split("-").reverse().join("/")} —{" "}
                {range.to.split("-").reverse().join("/")}
              </span>
            </p>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={comparePrevious}
                onChange={(e) => setComparePrevious(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#2b9af3] focus:ring-[#2b9af3]"
              />
              Comparar com o período anterior de mesma duração
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loading message="Carregando dados…" />
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Concluídos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statusInRange.completed}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Pendentes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statusInRange.pending}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Confirmados</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statusInRange.confirmed}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Cancelados</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statusInRange.cancelled}
                  </p>
                </div>
              </div>

              <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Faturamento concluído por mês
                </h2>
                {monthBuckets.length === 0 ? (
                  <p className="text-sm text-gray-500">Sem dados no intervalo.</p>
                ) : (
                  <div className="flex h-48 items-end justify-between gap-1 sm:gap-2">
                    {monthBuckets.map((b) => (
                      <div
                        key={b.label}
                        className="flex min-w-0 flex-1 flex-col items-center gap-2"
                      >
                        <div className="flex h-40 w-full items-end justify-center">
                          <div
                            className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-blue-600 to-green-500"
                            style={{
                              height: `${Math.max(
                                4,
                                (b.value / maxMonthValue) * 100,
                              )}%`,
                            }}
                            title={formatCurrency(b.value)}
                          />
                        </div>
                        <span className="max-w-full truncate text-center text-[10px] text-gray-500 sm:text-xs">
                          {b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Por espaço
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                  Ordenado do maior para o menor faturamento concluído no
                  período. O último da lista é o que menos gerou receita
                  concluída.
                </p>
                {clinicRanking.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhum agendamento no período.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-500">
                          <th className="pb-3 pr-4 font-medium">Espaço</th>
                          <th className="pb-3 pr-4 font-medium">Concluído</th>
                          <th className="pb-3 font-medium">Em aberto*</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clinicRanking.map((row, idx) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-50 last:border-0"
                          >
                            <td className="py-3 pr-4">
                              <span className="font-medium text-gray-900">
                                {idx === 0 && "↑ "}
                                {idx === clinicRanking.length - 1 &&
                                  clinicRanking.length > 1 &&
                                  "↓ "}
                                {row.title}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-gray-800">
                              {formatCurrency(row.completed)}
                            </td>
                            <td className="py-3 text-gray-600">
                              {formatCurrency(row.pending)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-3 text-xs text-gray-400">
                      *Pendente ou confirmado, com data no período selecionado.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FinanceiroDashboardPage;
