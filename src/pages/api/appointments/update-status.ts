import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { Appointment } from '@/types';

type ApiResponse = {
  data?: Appointment;
  error?: string;
};

type Body = {
  appointmentId?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidStatus = (
  status: unknown
): status is 'pending' | 'confirmed' | 'cancelled' | 'completed' =>
  status === 'pending' || status === 'confirmed' || status === 'cancelled' || status === 'completed';

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
    const appointmentId = body.appointmentId;
    const status = body.status;

    if (!isNonEmptyString(appointmentId) || !isValidStatus(status)) {
      res.status(400).json({ error: 'Dados inválidos para atualizar status' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();
    const { data, error } = await serviceClient
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select('*')
      .single();

    if (error || !data) {
      res.status(400).json({ error: error?.message || 'Erro ao atualizar status' });
      return;
    }

    res.status(200).json({ data: data as Appointment });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar status'
    });
  }
}
