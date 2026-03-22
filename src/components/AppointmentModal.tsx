import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Checkbox from '@/components/Checkbox';
import {
  CLINIC_BILLING_UI,
  buildConsultorioHourlySlots,
  formatPriceBrl,
  getClinicWeekdayKeyFromIsoDate,
  quoteAppointmentBooking,
  type AppointmentBookingQuote,
  type AppointmentBookingQuoteTail,
} from '@/constants/clinicPricing';

const appointmentTailFooterLines = (tail: AppointmentBookingQuoteTail) =>
  tail.mix ? (
    <>
      <p className="text-xs text-gray-500">
        R$ {formatPriceBrl(tail.mix.shiftUnitPrice)} por turno (4 h) ×{' '}
        {tail.mix.shiftTurnos}{' '}
        {tail.mix.shiftTurnos === 1 ? 'turno' : 'turnos'}
      </p>
      <p className="text-xs text-gray-500">
        R$ {formatPriceBrl(tail.mix.hourUnitPrice)} por hora ×{' '}
        {tail.mix.remainderHours}{' '}
        {tail.mix.remainderHours === 1 ? 'horário' : 'horários'}
      </p>
    </>
  ) : tail.billingUnit === 'shift' ? (
    <p className="text-xs text-gray-500">
      R$ {formatPriceBrl(tail.unitPrice)} por turno (4 h) × {tail.billableCount}{' '}
      {tail.billableCount === 1 ? 'turno' : 'turnos'}
    </p>
  ) : (
    <p className="text-xs text-gray-500">
      R$ {formatPriceBrl(tail.unitPrice)} por hora × {tail.billableCount}{' '}
      {tail.billableCount === 1 ? 'horário' : 'horários'}
    </p>
  );

export interface AppointmentFormData {
  date: string;
  selectionsByDate: Record<string, string[]>;
  notes?: string;
  acceptTerms: boolean;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: AppointmentFormData) => Promise<void>;
  clinicTitle: string;
  clinicPrice: number;
  pricePerShift?: number | null;
  pricePerDay?: number | null;
  clinicAvailability?: { id: string; day: string; startTime: string; endTime: string }[];
  existingAppointments?: { date: string; time: string; status: string }[];
}

type ModalAggregateQuote = {
  total: number;
  weekCount: number;
  primaryQuote: AppointmentBookingQuote;
  showDetailFooter: boolean;
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clinicTitle,
  clinicPrice,
  pricePerShift = null,
  pricePerDay = null,
  clinicAvailability = [],
  existingAppointments = []
}) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [formData, setFormData] = useState<AppointmentFormData>({
    date: '',
    selectionsByDate: {},
    notes: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ value: string; label: string; disabled: boolean }[]>([]);

  const activeSelectedTimes =
    formData.date && formData.selectionsByDate[formData.date]
      ? formData.selectionsByDate[formData.date]
      : [];

  const anchorWeekdayKey = useMemo(() => {
    const iso = Object.keys(formData.selectionsByDate).find(
      (k) => (formData.selectionsByDate[k]?.length ?? 0) > 0,
    );
    return iso ? getClinicWeekdayKeyFromIsoDate(iso) : null;
  }, [formData.selectionsByDate]);

  const hasAnySlotSelection = useMemo(
    () =>
      Object.values(formData.selectionsByDate).some((times) => times.length > 0),
    [formData.selectionsByDate],
  );

  const aggregateQuote = useMemo((): ModalAggregateQuote | null => {
    const entries = Object.entries(formData.selectionsByDate)
      .filter(([, t]) => t.length > 0)
      .sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) return null;

    let total = 0;
    const perDateQuotes: AppointmentBookingQuote[] = [];
    for (const [dateIso, times] of entries) {
      const slots = buildConsultorioHourlySlots(
        dateIso,
        clinicAvailability,
        existingAppointments,
      );
      const q = quoteAppointmentBooking(times, slots, {
        priceHour: clinicPrice,
        pricePerShift,
        pricePerDay,
      });
      if (!q || q.total <= 0) return null;
      total += q.total;
      perDateQuotes.push(q);
    }
    const first = perDateQuotes[0];
    if (!first) return null;
    const weekCount = perDateQuotes.length;
    let primaryQuote: AppointmentBookingQuote = first;
    if (weekCount > 1) {
      const allPureDayOne =
        perDateQuotes.every(
          (q) =>
            q.billingUnit === 'day' &&
            q.billableCount === 1 &&
            !q.diariaLead &&
            !q.tailAfterDiaria &&
            !q.mix,
        ) && perDateQuotes.every((q) => q.unitPrice === first.unitPrice);
      if (allPureDayOne) {
        primaryQuote = {
          billingUnit: 'day',
          billableCount: weekCount,
          unitPrice: first.unitPrice,
          total,
        };
      } else if (first.mix) {
        const allSameMix = perDateQuotes.every(
          (q) =>
            q.mix &&
            q.mix.shiftTurnos === first.mix!.shiftTurnos &&
            q.mix.remainderHours === first.mix!.remainderHours &&
            q.mix.shiftUnitPrice === first.mix!.shiftUnitPrice &&
            q.mix.hourUnitPrice === first.mix!.hourUnitPrice &&
            q.billingUnit === first.billingUnit,
        );
        if (allSameMix) {
          primaryQuote = {
            billingUnit: first.billingUnit,
            billableCount: first.billableCount,
            unitPrice: first.unitPrice,
            total,
            mix: {
              shiftTurnos: first.mix.shiftTurnos * weekCount,
              remainderHours: first.mix.remainderHours * weekCount,
              shiftUnitPrice: first.mix.shiftUnitPrice,
              hourUnitPrice: first.mix.hourUnitPrice,
            },
          };
        }
      }
    }
    return {
      total,
      weekCount,
      primaryQuote,
      showDetailFooter:
        weekCount === 1 || Math.abs(primaryQuote.total - total) < 0.005,
    };
  }, [
    formData.selectionsByDate,
    clinicAvailability,
    existingAppointments,
    clinicPrice,
    pricePerShift,
    pricePerDay,
  ]);

  const bookingQuote = aggregateQuote?.primaryQuote ?? null;

  const billingCopy = useMemo(() => {
    const unit = bookingQuote?.billingUnit ?? 'hour';
    return CLINIC_BILLING_UI[unit];
  }, [bookingQuote]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ];
  const availableDaysSet = new Set(clinicAvailability.map((item) => item.day));

  // Gerenciar scroll do body quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      // Salvar a posição atual do scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar o scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function
    return () => {
      if (isOpen) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setFormData({
        date: '',
        selectionsByDate: {},
        notes: '',
        acceptTerms: false,
      });
      setAvailableTimeSlots([]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        date: '',
        selectionsByDate: {},
        notes: '',
        acceptTerms: false,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeSelection = (time: string, checked: boolean) => {
    setFormData((prev) => {
      const d = prev.date;
      if (!d) return prev;
      const cur = prev.selectionsByDate[d] ?? [];
      const nextTimes = checked
        ? [...cur, time]
        : cur.filter((t) => t !== time);
      return {
        ...prev,
        selectionsByDate: {
          ...prev.selectionsByDate,
          [d]: nextTimes,
        },
      };
    });
  };

  const getDayOfWeekByDate = (date: Date): string => {
    const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return days[date.getDay()];
  };

  const formatDateToIso = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateSelectable = (date: Date): boolean => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayKey = getDayOfWeekByDate(normalizedDate);
    if (normalizedDate < todayStart || !availableDaysSet.has(dayKey)) {
      return false;
    }
    if (anchorWeekdayKey != null && dayKey !== anchorWeekdayKey) {
      return false;
    }
    return true;
  };

  const selectDate = (date: Date) => {
    if (!isDateSelectable(date)) return;
    const isoDate = formatDateToIso(date);
    setFormData((prev) => ({
      ...prev,
      date: isoDate,
    }));
    calculateAvailableTimeSlots(isoDate);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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

  const calculateAvailableTimeSlots = useCallback((selectedDate: string) => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    setAvailableTimeSlots(
      buildConsultorioHourlySlots(
        selectedDate,
        clinicAvailability,
        existingAppointments,
      ),
    );
  }, [clinicAvailability, existingAppointments]);

  useEffect(() => {
    if (formData.date) {
      calculateAvailableTimeSlots(formData.date);
    }
  }, [formData.date, calculateAvailableTimeSlots]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Agendar - ${clinicTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Data do Agendamento <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                aria-label="Mês anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="font-semibold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button
                type="button"
                onClick={goToNextMonth}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                aria-label="Próximo mês"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
              {weekDays.map((day) => (
                <div key={day} className="font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((date, index) => {
                if (!date) {
                  return <div key={`blank-${index}`} className="h-10" />;
                }

                const isoDate = formatDateToIso(date);
                const dayKey = getDayOfWeekByDate(date);
                const selected = formData.date === isoDate;
                const hasPicksForDay =
                  (formData.selectionsByDate[isoDate]?.length ?? 0) > 0;
                const selectable = isDateSelectable(date);
                const sameWeekdayOpen =
                  anchorWeekdayKey != null &&
                  dayKey === anchorWeekdayKey &&
                  selectable &&
                  !selected;

                return (
                  <button
                    key={isoDate}
                    type="button"
                    onClick={() => selectDate(date)}
                    disabled={!selectable}
                    className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                      !selectable
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : selected
                          ? 'bg-[#2b9af3] text-white'
                          : hasPicksForDay
                            ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-500'
                            : sameWeekdayOpen
                              ? 'bg-sky-50 text-sky-900 ring-2 ring-sky-400 hover:bg-sky-100'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            {hasAnySlotSelection && anchorWeekdayKey ? (
              <p className="mt-2 text-xs text-gray-600">
                Com horários escolhidos, use apenas o mesmo dia da semana em outras
                datas para repetir o agendamento; o valor total soma o calculado em
                cada data (hora, turno ou diária).
              </p>
            ) : null}
          </div>
        </div>

        {/* Seleção de horários */}
        {formData.date && availableTimeSlots.length > 0 && (
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              {`Horários disponíveis (${availableTimeSlots.filter((slot) => !slot.disabled).length})`}
            </label>
            <div className="rounded-lg border border-gray-200 bg-gray-50/60">
              <div
                className="max-h-80 min-h-56 overflow-y-auto overscroll-y-contain p-4 [scrollbar-gutter:stable]"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableTimeSlots.map((slot) => (
                    <div key={slot.value} className="relative">
                      {slot.disabled ? (
                        <div
                          className="flex h-full cursor-not-allowed items-center rounded-lg border-2 border-red-300 bg-red-50 p-3 text-red-800"
                          aria-disabled
                        >
                          <span className="text-sm font-medium leading-snug line-through">
                            {slot.label}
                          </span>
                        </div>
                      ) : (
                        <Checkbox
                          label={slot.label}
                          checked={activeSelectedTimes.includes(slot.value)}
                          onChange={(checked) =>
                            handleTimeSelection(slot.value, checked)
                          }
                          value={slot.value}
                          disabled={slot.disabled}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {availableTimeSlots.length > 6 && (
              <p className="mt-2 text-xs text-gray-500">
                Role a lista para ver todos os horários do dia.
              </p>
            )}
          </div>
        )}

        <Input
          label="Observações (opcional)"
          value={formData.notes}
          onChange={(value) => handleInputChange('notes', value)}
          placeholder="Ex: Primeira consulta, urgente, etc."
        />

        {/* Informações sobre disponibilidade */}
        {formData.date && availableTimeSlots.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Não há horários disponíveis</strong> para este dia da semana.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Tente selecionar outro dia ou entre em contato para verificar disponibilidade.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Totalizador */}
        {hasAnySlotSelection && aggregateQuote && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                {bookingQuote ? (
                  <>
                    {bookingQuote.diariaLead && bookingQuote.tailAfterDiaria ? (
                      <>
                        <p className="text-sm text-gray-600">Resumo</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {bookingQuote.diariaLead.count}{' '}
                          {bookingQuote.diariaLead.count === 1 ? 'diária' : 'diárias'}{' '}
                          (10 h) +{' '}
                          {bookingQuote.tailAfterDiaria.mix ? (
                            <>
                              {bookingQuote.tailAfterDiaria.mix.shiftTurnos}{' '}
                              {bookingQuote.tailAfterDiaria.mix.shiftTurnos === 1
                                ? 'turno'
                                : 'turnos'}{' '}
                              (4 h) +{' '}
                              {bookingQuote.tailAfterDiaria.mix.remainderHours}{' '}
                              {bookingQuote.tailAfterDiaria.mix.remainderHours === 1
                                ? 'horário'
                                : 'horários'}
                            </>
                          ) : bookingQuote.tailAfterDiaria.billingUnit === 'shift' ? (
                            <>
                              {bookingQuote.tailAfterDiaria.billableCount}{' '}
                              {bookingQuote.tailAfterDiaria.billableCount === 1
                                ? 'turno'
                                : 'turnos'}{' '}
                              (4 h)
                            </>
                          ) : (
                            <>
                              {bookingQuote.tailAfterDiaria.billableCount}{' '}
                              {bookingQuote.tailAfterDiaria.billableCount === 1
                                ? 'horário'
                                : 'horários'}
                            </>
                          )}
                        </p>
                      </>
                    ) : bookingQuote.mix ? (
                      <>
                        <p className="text-sm text-gray-600">Resumo</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {bookingQuote.mix.shiftTurnos}{' '}
                          {bookingQuote.mix.shiftTurnos === 1 ? 'turno' : 'turnos'} (4 h) +{' '}
                          {bookingQuote.mix.remainderHours}{' '}
                          {bookingQuote.mix.remainderHours === 1
                            ? 'horário'
                            : 'horários'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          {aggregateQuote.weekCount > 1
                            ? 'Total no mesmo dia da semana'
                            : billingCopy.quantityHeading}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {aggregateQuote.weekCount > 1 &&
                          bookingQuote.billingUnit === 'day' &&
                          !bookingQuote.diariaLead &&
                          !bookingQuote.mix
                            ? `${bookingQuote.billableCount} ${
                                bookingQuote.billableCount === 1
                                  ? 'diária'
                                  : 'diárias'
                              } (10 h)`
                            : aggregateQuote.weekCount > 1
                              ? `${aggregateQuote.weekCount} datas`
                              : `${bookingQuote.billableCount} ${
                                  bookingQuote.billableCount === 1
                                    ? billingCopy.quantityOne
                                    : billingCopy.quantityMany
                                }`}
                        </p>
                      </>
                    )}
                  </>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {formatPriceBrl(aggregateQuote.total)}
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
              {bookingQuote && aggregateQuote.showDetailFooter ? (
                <>
                  {bookingQuote.diariaLead && bookingQuote.tailAfterDiaria ? (
                    <>
                      <p className="text-xs text-gray-500">
                        R$ {formatPriceBrl(bookingQuote.diariaLead.unitPrice)} por diária
                        (10 h) × {bookingQuote.diariaLead.count}{' '}
                        {bookingQuote.diariaLead.count === 1 ? 'diária' : 'diárias'}
                      </p>
                      {appointmentTailFooterLines(bookingQuote.tailAfterDiaria)}
                    </>
                  ) : bookingQuote.mix ? (
                    <>
                      <p className="text-xs text-gray-500">
                        R$ {formatPriceBrl(bookingQuote.mix.shiftUnitPrice)} por turno (4
                        h) × {bookingQuote.mix.shiftTurnos}{' '}
                        {bookingQuote.mix.shiftTurnos === 1 ? 'turno' : 'turnos'}
                      </p>
                      <p className="text-xs text-gray-500">
                        R$ {formatPriceBrl(bookingQuote.mix.hourUnitPrice)} por hora ×{' '}
                        {bookingQuote.mix.remainderHours}{' '}
                        {bookingQuote.mix.remainderHours === 1
                          ? 'horário'
                          : 'horários'}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {bookingQuote.billingUnit === 'shift'
                        ? `R$ ${formatPriceBrl(bookingQuote.unitPrice)} por turno (4 h) × ${bookingQuote.billableCount} ${bookingQuote.billableCount === 1 ? 'turno' : 'turnos'}`
                        : bookingQuote.billingUnit === 'day'
                          ? `R$ ${formatPriceBrl(bookingQuote.unitPrice)} por diária (10 h) × ${bookingQuote.billableCount} ${bookingQuote.billableCount === 1 ? 'diária' : 'diárias'}`
                          : `R$ ${formatPriceBrl(bookingQuote.unitPrice)} ${billingCopy.perUnit} × ${bookingQuote.billableCount} ${bookingQuote.billableCount === 1 ? billingCopy.quantityOne : billingCopy.quantityMany}`}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500">
                  Soma dos valores calculados em cada data (hora, turno ou diária).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Checkbox de aceite dos termos */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-[#2b9af3] focus:ring-[#2b9af3] focus:ring-2 focus:ring-offset-0"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
            Ao confirmar agendamento, você concorda com os{' '}
            <a href="/termos-de-uso" target="_blank" className="text-[#2b9af3] hover:underline">
              termos de uso
            </a>{' '}
            e{' '}
            <a href="/politica-privacidade" target="_blank" className="text-[#2b9af3] hover:underline">
              política de privacidade
            </a>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.date ||
              !hasAnySlotSelection ||
              !aggregateQuote ||
              availableTimeSlots.length === 0 ||
              !formData.acceptTerms
            }
            className="flex-1 order-1 sm:order-1"
          >
            {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="order-2 sm:order-2"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;
