export const formatPriceBrl = (value: number): string =>
  value.toFixed(2).replace(".", ",");

export type ClinicBillingUnit = "hour" | "shift" | "day" | "month";

type ClinicPriceSlice = {
  price: number;
  price_per_shift?: number | null;
  price_per_day?: number | null;
  price_per_month?: number | null;
};

const priceClose = (a: number, b: unknown): boolean =>
  typeof b === "number" && Number.isFinite(b) && Math.abs(a - b) < 0.01;

export const resolveClinicBillingUnitForPrice = (
  appliedPrice: number,
  clinic: ClinicPriceSlice,
): ClinicBillingUnit => {
  if (Number.isFinite(appliedPrice) && appliedPrice > 0) {
    if (priceClose(appliedPrice, clinic.price)) return "hour";
    if (priceClose(appliedPrice, clinic.price_per_shift)) return "shift";
    if (priceClose(appliedPrice, clinic.price_per_day)) return "day";
    if (priceClose(appliedPrice, clinic.price_per_month)) return "month";
  }
  if ((clinic.price ?? 0) > 0) return "hour";
  if ((clinic.price_per_shift ?? 0) > 0) return "shift";
  if ((clinic.price_per_day ?? 0) > 0) return "day";
  if ((clinic.price_per_month ?? 0) > 0) return "month";
  return "hour";
};

export const CLINIC_BILLING_UI: Record<
  ClinicBillingUnit,
  {
    quantityHeading: string;
    quantityOne: string;
    quantityMany: string;
    perUnit: string;
  }
> = {
  hour: {
    quantityHeading: "Quantidade de horários",
    quantityOne: "horário",
    quantityMany: "horários",
    perUnit: "por hora",
  },
  shift: {
    quantityHeading: "Quantidade de turnos",
    quantityOne: "turno",
    quantityMany: "turnos",
    perUnit: "por turno",
  },
  day: {
    quantityHeading: "Quantidade de diárias",
    quantityOne: "diária",
    quantityMany: "diárias",
    perUnit: "por diária",
  },
  month: {
    quantityHeading: "Quantidade de meses",
    quantityOne: "mês",
    quantityMany: "meses",
    perUnit: "por mês",
  },
};

export type AppointmentSlotOption = {
  value: string;
  label: string;
  disabled: boolean;
};

export const normalizeAppointmentSlotTime = (time: string): string => {
  const t = time.trim();
  return t.length >= 5 ? t.substring(0, 5) : t;
};

export const getClinicWeekdayKeyFromIsoDate = (isoDate: string): string => {
  const days = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];
  const parts = isoDate.split("-").map(Number);
  const y = parts[0];
  const mo = parts[1];
  const d = parts[2];
  if (!y || !mo || !d) return "";
  const date = new Date(y, mo - 1, d);
  return days[date.getDay()] ?? "";
};

const slotKeyFromAvailabilityTime = (time: string): string | null => {
  const m = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (
    !Number.isFinite(h) ||
    !Number.isFinite(min) ||
    h < 0 ||
    h > 23 ||
    min < 0 ||
    min > 59
  ) {
    return null;
  }
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

const minutesFromSlotKey = (key: string): number | null => {
  const m = /^(\d{2}):(\d{2})$/.exec(key);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
};

const formatMinutesAsSlotKey = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const expandAvailabilityBlockToHourlyParts = (
  startKey: string,
  endKey: string,
): { value: string; label: string }[] => {
  const startM = minutesFromSlotKey(startKey);
  const endM = minutesFromSlotKey(endKey);
  if (startM === null || endM === null || endM <= startM) return [];
  if (startM % 60 !== 0 || endM % 60 !== 0) {
    return [{ value: startKey, label: `${startKey} às ${endKey}` }];
  }
  const out: { value: string; label: string }[] = [];
  for (let cur = startM; cur + 60 <= endM; cur += 60) {
    const a = formatMinutesAsSlotKey(cur);
    const b = formatMinutesAsSlotKey(cur + 60);
    out.push({ value: a, label: `${a} às ${b}` });
  }
  return out.length > 0
    ? out
    : [{ value: startKey, label: `${startKey} às ${endKey}` }];
};

export const buildConsultorioHourlySlots = (
  isoDate: string,
  clinicAvailability: { day: string; startTime: string; endTime: string }[],
  existingAppointments: { date: string; time: string; status: string }[],
): AppointmentSlotOption[] => {
  const dayKey = getClinicWeekdayKeyFromIsoDate(isoDate);
  const dayBlocks = clinicAvailability.filter((a) => a.day === dayKey);
  if (dayBlocks.length === 0) return [];

  const occupied = (startTime: string): boolean =>
    existingAppointments.some((apt) => {
      const dateMatch = apt.date === isoDate;
      const timeMatch = normalizeAppointmentSlotTime(apt.time) === startTime;
      const statusMatch =
        apt.status === "pending" ||
        apt.status === "confirmed" ||
        apt.status === "completed";
      return dateMatch && timeMatch && statusMatch;
    });

  const byValue = new Map<string, AppointmentSlotOption>();
  dayBlocks.forEach((block) => {
    const sk = slotKeyFromAvailabilityTime(block.startTime);
    const ek = slotKeyFromAvailabilityTime(block.endTime);
    if (!sk || !ek) return;
    const parts = expandAvailabilityBlockToHourlyParts(sk, ek);
    parts.forEach((p) => {
      const dis = occupied(p.value);
      const prev = byValue.get(p.value);
      if (prev) {
        byValue.set(p.value, {
          value: p.value,
          label: p.label,
          disabled: prev.disabled || dis,
        });
      } else {
        byValue.set(p.value, {
          value: p.value,
          label: p.label,
          disabled: dis,
        });
      }
    });
  });

  return Array.from(byValue.values()).sort((a, b) => {
    const am = minutesFromSlotKey(a.value) ?? 0;
    const bm = minutesFromSlotKey(b.value) ?? 0;
    return am - bm;
  });
};

export type AppointmentQuotePrices = {
  priceHour: number;
  pricePerShift?: number | null;
  pricePerDay?: number | null;
};

export const HOURS_PER_SHIFT = 4;

export const HOURS_PER_DIARIA = 10;

export type AppointmentBookingQuoteMix = {
  shiftTurnos: number;
  shiftUnitPrice: number;
  remainderHours: number;
  hourUnitPrice: number;
};

export type AppointmentBookingQuoteTail = {
  billingUnit: ClinicBillingUnit;
  billableCount: number;
  unitPrice: number;
  total: number;
  mix?: AppointmentBookingQuoteMix;
};

export type AppointmentBookingQuote = {
  billingUnit: ClinicBillingUnit;
  billableCount: number;
  unitPrice: number;
  total: number;
  mix?: AppointmentBookingQuoteMix;
  diariaLead?: { count: number; unitPrice: number };
  tailAfterDiaria?: AppointmentBookingQuoteTail;
};

type ShiftHourSub = {
  billingUnit: ClinicBillingUnit;
  billableCount: number;
  unitPrice: number;
  total: number;
  mix?: AppointmentBookingQuoteMix;
};

const quoteShiftAndHourForN = (
  nHours: number,
  shiftNum: number | null,
  hourNum: number,
): ShiftHourSub => {
  if (nHours <= 0) {
    return {
      billingUnit: "hour",
      billableCount: 0,
      unitPrice: hourNum,
      total: 0,
    };
  }
  if (shiftNum != null) {
    if (hourNum > 0) {
      const turnos = Math.floor(nHours / HOURS_PER_SHIFT);
      const rem = nHours % HOURS_PER_SHIFT;
      if (turnos === 0) {
        return {
          billingUnit: "hour",
          billableCount: nHours,
          unitPrice: hourNum,
          total: hourNum * nHours,
        };
      }
      if (rem === 0) {
        return {
          billingUnit: "shift",
          billableCount: turnos,
          unitPrice: shiftNum,
          total: turnos * shiftNum,
        };
      }
      return {
        billingUnit: "hour",
        billableCount: nHours,
        unitPrice: hourNum,
        total: turnos * shiftNum + rem * hourNum,
        mix: {
          shiftTurnos: turnos,
          shiftUnitPrice: shiftNum,
          remainderHours: rem,
          hourUnitPrice: hourNum,
        },
      };
    }
    const turnosCeil = Math.ceil(nHours / HOURS_PER_SHIFT);
    return {
      billingUnit: "shift",
      billableCount: turnosCeil,
      unitPrice: shiftNum,
      total: turnosCeil * shiftNum,
    };
  }
  return {
    billingUnit: "hour",
    billableCount: nHours,
    unitPrice: hourNum,
    total: hourNum * nHours,
  };
};

export const quoteAppointmentBooking = (
  selectedSlotValues: string[],
  slots: AppointmentSlotOption[],
  prices: AppointmentQuotePrices,
): AppointmentBookingQuote | null => {
  if (selectedSlotValues.length === 0) return null;
  const selectableSet = new Set(
    slots.filter((s) => !s.disabled).map((s) => s.value),
  );
  if (
    !selectedSlotValues.every((v) => selectableSet.has(v)) ||
    new Set(selectedSlotValues).size !== selectedSlotValues.length
  ) {
    return null;
  }

  const chosen = new Set(selectedSlotValues);
  const enabledSlots = slots.filter((s) => !s.disabled);
  const pickedWholeEnabledDay =
    enabledSlots.length > 0 &&
    enabledSlots.every((s) => chosen.has(s.value)) &&
    chosen.size === selectedSlotValues.length &&
    selectedSlotValues.length === enabledSlots.length;

  const shift =
    prices.pricePerShift != null &&
    Number.isFinite(prices.pricePerShift) &&
    prices.pricePerShift > 0
      ? prices.pricePerShift
      : null;
  const day =
    prices.pricePerDay != null &&
    Number.isFinite(prices.pricePerDay) &&
    prices.pricePerDay > 0
      ? prices.pricePerDay
      : null;
  const hour =
    Number.isFinite(prices.priceHour) && prices.priceHour > 0
      ? prices.priceHour
      : 0;

  const n = selectedSlotValues.length;
  const nForDayBlocks =
    day != null && pickedWholeEnabledDay ? enabledSlots.length : n;

  if (day != null) {
    const d = Math.floor(nForDayBlocks / HOURS_PER_DIARIA);
    const r = nForDayBlocks % HOURS_PER_DIARIA;

    if (d > 0) {
      const dayTotal = d * day;
      if (r === 0) {
        return {
          billingUnit: "day",
          billableCount: d,
          unitPrice: day,
          total: dayTotal,
        };
      }
      const tail = quoteShiftAndHourForN(r, shift, hour);
      return {
        billingUnit: "day",
        billableCount: d,
        unitPrice: day,
        total: dayTotal + tail.total,
        diariaLead: { count: d, unitPrice: day },
        tailAfterDiaria: tail,
      };
    }
    if (
      pickedWholeEnabledDay &&
      d === 0 &&
      nForDayBlocks >= HOURS_PER_DIARIA - 1
    ) {
      return {
        billingUnit: "day",
        billableCount: 1,
        unitPrice: day,
        total: day,
      };
    }
  }

  const tailFull = quoteShiftAndHourForN(n, shift, hour);
  return {
    billingUnit: tailFull.billingUnit,
    billableCount: tailFull.billableCount,
    unitPrice: tailFull.unitPrice,
    total: tailFull.total,
    mix: tailFull.mix,
  };
};

export const distributeAppointmentTotalAcrossSlots = (
  totalReais: number,
  slotCount: number,
): number[] => {
  if (
    slotCount <= 0 ||
    !Number.isFinite(totalReais) ||
    totalReais <= 0
  ) {
    return [];
  }
  const totalCents = Math.round(totalReais * 100);
  const base = Math.floor(totalCents / slotCount);
  const remainder = totalCents - base * slotCount;
  return Array.from(
    { length: slotCount },
    (_, i) => (base + (i < remainder ? 1 : 0)) / 100,
  );
};

export const CLINIC_PRICING_FIELD_HINTS = {
  priceHour: "Valor cobrado por cada hora de uso. Campo obrigatório.",
  priceShift: `1 turno = ${HOURS_PER_SHIFT} horas de uso. Valor fixo por turno (ex.: manhã ou tarde).`,
  priceDay: `1 diária = ${HOURS_PER_DIARIA} horas de uso. Valor fixo por esse período.`,
  priceMonth: "Valor mensal para uso recorrente no espaço.",
} as const;

export const parseOptionalPriceField = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return value;
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return null;
    const n = parseFloat(t.replace(/[^\d,.-]/g, "").replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }
  return null;
};
