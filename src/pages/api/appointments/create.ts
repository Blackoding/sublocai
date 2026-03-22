import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { Appointment } from '@/types';
import { distributeAppointmentTotalAcrossSlots } from '@/constants/clinicPricing';

type ApiResponse = {
  data?: Appointment[];
  error?: string;
};

type Body = {
  clinicId?: string;
  userId?: string;
  date?: string;
  selectedTimes?: string[];
  notes?: string;
  valuePerSession?: number;
  totalBookingValue?: number;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const isValidTime = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);

const normalizeTimes = (times: unknown): string[] => {
  if (!Array.isArray(times)) return [];
  return times
    .filter((t): t is string => isValidTime(t))
    .map((t) => `${t}:00`);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const body = req.body as Body;
    const clinicId = body.clinicId;
    const userId = body.userId;
    const date = body.date;
    const selectedTimes = normalizeTimes(body.selectedTimes);
    const valuePerSession = body.valuePerSession;
    const totalBookingValue = body.totalBookingValue;

    const hasHourlyPricing =
      typeof valuePerSession === 'number' && valuePerSession > 0;
    const hasPackagePricing =
      typeof totalBookingValue === 'number' && totalBookingValue > 0;

    if (
      !isNonEmptyString(clinicId) ||
      !isNonEmptyString(userId) ||
      !isValidDate(date) ||
      selectedTimes.length === 0 ||
      (!hasHourlyPricing && !hasPackagePricing)
    ) {
      res.status(400).json({ error: 'Dados de agendamento inválidos' });
      return;
    }

    const perSlotValues = hasPackagePricing
      ? distributeAppointmentTotalAcrossSlots(
          totalBookingValue,
          selectedTimes.length,
        )
      : null;

    if (
      hasPackagePricing &&
      (!perSlotValues || perSlotValues.length !== selectedTimes.length)
    ) {
      res.status(400).json({ error: 'Dados de agendamento inválidos' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { data: occupied, error: occupiedError } = await serviceClient
      .from('appointments')
      .select('time,status')
      .eq('clinic_id', clinicId)
      .eq('date', date)
      .in('time', selectedTimes)
      .in('status', ['pending', 'confirmed', 'completed']);

    if (occupiedError) {
      res.status(400).json({ error: occupiedError.message });
      return;
    }

    if ((occupied || []).length > 0) {
      res.status(409).json({ error: 'Um ou mais horários selecionados já estão ocupados' });
      return;
    }

    const records = selectedTimes.map((time, index) => ({
      clinic_id: clinicId,
      user_id: userId,
      date,
      time,
      notes: isNonEmptyString(body.notes) ? body.notes.trim() : null,
      value: perSlotValues ? perSlotValues[index]! : valuePerSession!,
      status: 'pending' as const
    }));

    const { data, error } = await serviceClient
      .from('appointments')
      .insert(records)
      .select('*');

    if (error || !data) {
      res.status(400).json({ error: error?.message || 'Erro ao criar agendamentos' });
      return;
    }

    await serviceClient.rpc('increment_clinic_bookings', {
      clinic_id_input: clinicId,
      increment_by: records.length
    });

    res.status(201).json({ data: data as Appointment[] });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao criar agendamentos'
    });
  }
}
