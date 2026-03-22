import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Appointment, AppointmentFilters, Clinic } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { clinicUtils } from "@/services/clinicService";
import { AppointmentService } from "@/services/appointmentService";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Loading from "@/components/Loading";
import AppointmentCard from "@/components/AppointmentCard";
import { BackButton } from "@/components/BackButton";

const AppointmentsPage = () => {
  const router = useRouter();
  const { clinic } = router.query;
  const { user, isLoading, isAuthenticated, getCurrentUser } = useAuthStore();
  const isCompanyUser = user?.userType === "company";

  // Filtros
  const [filters, setFilters] = useState<AppointmentFilters>({
    date_from: "",
    date_to: "",
    period: "all",
    day_of_week: "all",
    status: "all",
    clinic_id: "",
  });

  // Estado para consultórios do usuário
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>("");
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Função para carregar consultórios do usuário
  const loadUserClinics = async () => {
    if (!user?.id) return;

    try {
      setLoadingClinics(true);
      console.log(
        "AppointmentsPage - Carregando consultórios do usuário:",
        user.id,
      );

      const result = await clinicUtils.getClinicsByUser(user.id);

      if (result.success && result.clinics) {
        setClinics(result.clinics);
        console.log(
          "AppointmentsPage - Consultórios carregados:",
          result.clinics.length,
        );
      } else {
        console.error(
          "AppointmentsPage - Erro ao carregar consultórios:",
          result.error,
        );
      }
    } catch (error) {
      console.error(
        "AppointmentsPage - Erro inesperado ao carregar consultórios:",
        error,
      );
    } finally {
      setLoadingClinics(false);
    }
  };

  // Inicializar autenticação
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated && router.isReady) {
      console.log("AppointmentsPage - Chamando getCurrentUser...");
      getCurrentUser();
    }
  }, [isAuthenticated, router.isReady]);

  // Carregar consultórios quando o usuário estiver disponível
  useEffect(() => {
    if (user?.id) {
      loadUserClinics();
    }
  }, [user?.id]);

  const applyLocalFilters = (data: Appointment[]): Appointment[] => {
    return data.filter((appointment) => {
      if (filters.clinic_id && appointment.clinic_id !== filters.clinic_id)
        return false;
      if (
        filters.status &&
        filters.status !== "all" &&
        appointment.status !== filters.status
      )
        return false;
      if (filters.date_from && appointment.date < filters.date_from)
        return false;
      if (filters.date_to && appointment.date > filters.date_to) return false;

      if (filters.day_of_week && filters.day_of_week !== "all") {
        const [year, month, day] = appointment.date.split("-").map(Number);
        const currentDate = new Date(year, month - 1, day);
        const weekMap: Record<number, AppointmentFilters["day_of_week"]> = {
          0: "sunday",
          1: "monday",
          2: "tuesday",
          3: "wednesday",
          4: "thursday",
          5: "friday",
          6: "saturday",
        };
        if (weekMap[currentDate.getDay()] !== filters.day_of_week) return false;
      }

      if (filters.period && filters.period !== "all") {
        const hour = Number((appointment.time || "00:00").slice(0, 2));
        if (filters.period === "morning" && !(hour >= 6 && hour < 12))
          return false;
        if (filters.period === "afternoon" && !(hour >= 12 && hour < 18))
          return false;
        if (filters.period === "evening" && !(hour >= 18 && hour <= 23))
          return false;
      }

      return true;
    });
  };

  const loadAppointments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await AppointmentService.getAllUserAppointments(user.id);
      if (result.error) {
        setError(result.error);
        setAppointments([]);
        return;
      }

      const filtered = applyLocalFilters(result.data || []);
      setAppointments(filtered);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar agendamentos",
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed",
  ): Promise<void> => {
    const result = await AppointmentService.updateAppointmentStatus(
      appointmentId,
      newStatus,
    );
    if (result.error) {
      setError(result.error);
      return;
    }
    await loadAppointments();
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>(
      (acc, appointment) => {
        const key = appointment.date;
        if (!acc[key]) acc[key] = [];
        acc[key].push(appointment);
        return acc;
      },
      {},
    );
  }, [appointments]);

  const formatDateToIso = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const getCalendarDays = (): (Date | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingBlanks = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < leadingBlanks; i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const selectedDayAppointments = selectedCalendarDate
    ? appointmentsByDate[selectedCalendarDate] || []
    : [];

  // Aplicar filtro de consultório quando a URL contém o parâmetro clinic
  // Aguardar os consultórios serem carregados primeiro
  useEffect(() => {
    if (
      router.isReady &&
      clinic &&
      typeof clinic === "string" &&
      clinics.length > 0
    ) {
      console.log(
        "AppointmentsPage - Aplicando filtro de consultório da URL:",
        clinic,
      );
      console.log(
        "AppointmentsPage - Consultórios disponíveis:",
        clinics.length,
      );
      setFilters((prev) => ({
        ...prev,
        clinic_id: clinic,
      }));

      // Aplicar filtros automaticamente quando vem de ClinicCard
      console.log("AppointmentsPage - Aplicando filtros automaticamente...");
    }
  }, [router.isReady, clinic, clinics.length]);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user?.id, filters]);

  // Debug: verificar se o parâmetro clinic está sendo passado corretamente
  useEffect(() => {
    console.log("AppointmentsPage - Router query:", router.query);
    console.log("AppointmentsPage - Clinic parameter:", clinic);
    console.log("AppointmentsPage - Router ready:", router.isReady);
    console.log("AppointmentsPage - Filters:", filters);
    console.log("AppointmentsPage - Clinics loaded:", clinics.length);
    console.log("AppointmentsPage - Loading clinics:", loadingClinics);
  }, [
    router.query,
    clinic,
    router.isReady,
    filters,
    clinics.length,
    loadingClinics,
  ]);

  // Aplicar filtros
  const applyFilters = () => {
    loadAppointments();
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      date_from: "",
      date_to: "",
      period: "all",
      day_of_week: "all",
      status: "all",
      clinic_id: "",
    });
  };

  const hasActiveFilters =
    filters.date_from !== "" ||
    filters.date_to !== "" ||
    filters.period !== "all" ||
    filters.day_of_week !== "all" ||
    filters.status !== "all" ||
    filters.clinic_id !== "";

  // Debug: verificar estado de autenticação
  console.log("AppointmentsPage - Estado de autenticação:", {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
  });

  // Verificar autenticação
  if (isLoading) {
    console.log("AppointmentsPage - Mostrando loading...");
    return <Loading />;
  }

  // Verificação de autenticação
  void isAuthenticated;
  void user;

  console.log("AppointmentsPage - Usuário autenticado, renderizando página...");

  return (
    <>
      <Head>
        <title>Agendamentos - Sublease</title>
        <meta
          name="description"
          content="Gerencie todos os agendamentos dos seus espaços"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header da página */}
            <div className="mb-8 mt-16">
              <BackButton />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">
                Meus Agendamentos
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie todos os agendamentos dos seus espaços
              </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {stats.confirmed}
                </div>
                <div className="text-sm text-gray-600">Confirmados</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </div>
                <div className="text-sm text-gray-600">Cancelados</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Filtros
              </h2>

              {viewMode === "calendar" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Período"
                      value={filters.period || "all"}
                      onChange={(value) =>
                        setFilters({
                          ...filters,
                          period: value as
                            | "morning"
                            | "afternoon"
                            | "evening"
                            | "all",
                        })
                      }
                      options={[
                        { value: "all", label: "Todos" },
                        { value: "morning", label: "Manhã (06:00-12:00)" },
                        { value: "afternoon", label: "Tarde (12:00-18:00)" },
                        { value: "evening", label: "Noite (18:00-23:59)" },
                      ]}
                    />
                  </div>
                  <div>
                    <Select
                      label="Status"
                      value={filters.status || "all"}
                      onChange={(value) =>
                        setFilters({
                          ...filters,
                          status: value as
                            | "pending"
                            | "confirmed"
                            | "cancelled"
                            | "completed"
                            | "all",
                        })
                      }
                      options={[
                        { value: "all", label: "Todos" },
                        { value: "pending", label: "Pendente" },
                        { value: "confirmed", label: "Confirmado" },
                        { value: "cancelled", label: "Cancelado" },
                        { value: "completed", label: "Concluído" },
                      ]}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Primeira linha: Data Inicial | Data Final | Período */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Input
                        label="Data Inicial"
                        type="date"
                        value={filters.date_from || ""}
                        onChange={(value) =>
                          setFilters({ ...filters, date_from: value })
                        }
                      />
                    </div>

                    <div>
                      <Input
                        label="Data Final"
                        type="date"
                        value={filters.date_to || ""}
                        onChange={(value) =>
                          setFilters({ ...filters, date_to: value })
                        }
                      />
                    </div>

                    <div>
                      <Select
                        label="Período"
                        value={filters.period || "all"}
                        onChange={(value) =>
                          setFilters({
                            ...filters,
                            period: value as
                              | "morning"
                              | "afternoon"
                              | "evening"
                              | "all",
                          })
                        }
                        options={[
                          { value: "all", label: "Todos" },
                          { value: "morning", label: "Manhã (06:00-12:00)" },
                          { value: "afternoon", label: "Tarde (12:00-18:00)" },
                          { value: "evening", label: "Noite (18:00-23:59)" },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Segunda linha: Dia da Semana | Status | Espaço */}
                  <div
                    className={`grid grid-cols-1 ${isCompanyUser ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}
                  >
                    <div>
                      <Select
                        label="Dia da Semana"
                        value={filters.day_of_week || "all"}
                        onChange={(value) =>
                          setFilters({
                            ...filters,
                            day_of_week: value as
                              | "monday"
                              | "tuesday"
                              | "wednesday"
                              | "thursday"
                              | "friday"
                              | "saturday"
                              | "sunday"
                              | "all",
                          })
                        }
                        options={[
                          { value: "all", label: "Todos" },
                          { value: "monday", label: "Segunda-feira" },
                          { value: "tuesday", label: "Terça-feira" },
                          { value: "wednesday", label: "Quarta-feira" },
                          { value: "thursday", label: "Quinta-feira" },
                          { value: "friday", label: "Sexta-feira" },
                          { value: "saturday", label: "Sábado" },
                          { value: "sunday", label: "Domingo" },
                        ]}
                      />
                    </div>

                    <div>
                      <Select
                        label="Status"
                        value={filters.status || "all"}
                        onChange={(value) =>
                          setFilters({
                            ...filters,
                            status: value as
                              | "pending"
                              | "confirmed"
                              | "cancelled"
                              | "completed"
                              | "all",
                          })
                        }
                        options={[
                          { value: "all", label: "Todos" },
                          { value: "pending", label: "Pendente" },
                          { value: "confirmed", label: "Confirmado" },
                          { value: "cancelled", label: "Cancelado" },
                          { value: "completed", label: "Concluído" },
                        ]}
                      />
                    </div>

                    {isCompanyUser && (
                      <div>
                        <Select
                          label="Espaço"
                          value={filters.clinic_id || "all"}
                          onChange={(value) => {
                            console.log(
                              "AppointmentsPage - Select onChange:",
                              value,
                            );
                            setFilters({
                              ...filters,
                              clinic_id: value === "all" ? "" : value,
                            });
                          }}
                          options={[
                            { value: "all", label: "Todos os espaços" },
                            ...clinics.map((clinic) => ({
                              value: clinic.id || "",
                              label: clinic.title || "Espaço sem nome",
                            })),
                          ]}
                          disabled={loadingClinics}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-4">
                <Button onClick={applyFilters}>Aplicar Filtros</Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-[#2b9af3] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "calendar"
                      ? "bg-[#2b9af3] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Calendário
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Agendamentos ({appointments.length})
                  </h2>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <Loading />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-600">{error}</p>
                    <Button onClick={loadAppointments} className="mt-4">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">
                      Nenhum agendamento encontrado
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onUpdateStatus={updateAppointmentStatus}
                        viewerUserType={user?.userType}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                      aria-label="Mês anterior"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h2>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                      aria-label="Próximo mês"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {getCalendarDays().map((date, index) => {
                      if (!date) {
                        return <div key={`blank-${index}`} className="h-14" />;
                      }

                      const isoDate = formatDateToIso(date);
                      const hasAppointments =
                        (appointmentsByDate[isoDate] || []).length > 0;
                      const isSelected = selectedCalendarDate === isoDate;
                      const isCurrentMonth =
                        date.getMonth() === currentMonth.getMonth();

                      return (
                        <button
                          key={isoDate}
                          type="button"
                          onClick={() => setSelectedCalendarDate(isoDate)}
                          className={`h-14 rounded-lg border text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-[#2b9af3] bg-blue-50 text-[#2b9af3]"
                              : hasAppointments
                                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                          } ${!isCurrentMonth ? "opacity-50" : ""}`}
                        >
                          <div className="relative flex items-center justify-center w-full h-full">
                            <span>{date.getDate()}</span>
                            {hasAppointments && (
                              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2b9af3] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
                                {(appointmentsByDate[isoDate] || []).length}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCalendarDate
                        ? `Agendamentos de ${selectedCalendarDate.split("-").reverse().join("/")}`
                        : "Selecione um dia no calendário"}
                    </h3>
                  </div>

                  {!selectedCalendarDate ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">
                        Selecione um dia para visualizar os agendamentos
                      </p>
                    </div>
                  ) : selectedDayAppointments.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">
                        Nenhum agendamento para este dia
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {selectedDayAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onUpdateStatus={updateAppointmentStatus}
                          viewerUserType={user?.userType}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AppointmentsPage;
