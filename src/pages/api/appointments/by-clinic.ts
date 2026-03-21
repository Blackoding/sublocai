import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { Appointment } from '@/types';

type ApiResponse = {
  data?: Appointment[];
  error?: string;
};

type Body = {
  clinicId?: string;
};

type ClinicRow = {
  id: string;
  title?: string | null;
  user_id?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
};

type OwnerRow = {
  id: string;
  trade_name?: string | null;
  company_name?: string | null;
  cnpj?: string | null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

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

    if (!isNonEmptyString(clinicId)) {
      res.status(400).json({ error: 'Consultório inválido' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();
    const { data, error } = await serviceClient
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    const appointments = (data as Appointment[]) || [];

    const { data: clinicRows, error: clinicError } = await serviceClient
      .from('clinics')
      .select('id,title,user_id,street,number,neighborhood,city,state')
      .eq('id', clinicId)
      .limit(1);

    if (clinicError) {
      res.status(400).json({ error: clinicError.message });
      return;
    }

    const clinicRow = ((clinicRows || []) as ClinicRow[])[0];
    const ownerId = clinicRow?.user_id || '';
    let ownerRow: OwnerRow | null = null;

    if (ownerId) {
      const { data: ownerRows, error: ownerError } = await serviceClient
        .from('users')
        .select('id,trade_name,company_name,cnpj')
        .eq('id', ownerId)
        .limit(1);

      if (ownerError) {
        res.status(400).json({ error: ownerError.message });
        return;
      }

      ownerRow = ((ownerRows || []) as OwnerRow[])[0] || null;
    }

    const clinicCompanyName = ownerRow?.trade_name || ownerRow?.company_name || '';
    const clinicCnpj = ownerRow?.cnpj || '';
    const clinicAddress = [
      [clinicRow?.street, clinicRow?.number].filter(Boolean).join(', '),
      clinicRow?.neighborhood || '',
      [clinicRow?.city, clinicRow?.state].filter(Boolean).join(' - ')
    ]
      .filter(Boolean)
      .join(' • ');

    const mappedAppointments = appointments.map((appointment) => ({
      ...appointment,
      clinic_title: appointment.clinic_title || clinicRow?.title || '',
      clinic_company_name: clinicCompanyName,
      clinic_cnpj: clinicCnpj,
      clinic_address: clinicAddress
    }));

    res.status(200).json({ data: mappedAppointments });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar agendamentos'
    });
  }
}
