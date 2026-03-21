import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { Appointment } from '@/types';

type ApiResponse = {
  data?: Appointment[];
  error?: string;
};

type Body = {
  userId?: string;
};

type UserRow = {
  id: string;
  email: string;
  user_type: 'professional' | 'company';
  phone: string;
  full_name?: string | null;
  company_name?: string | null;
  trade_name?: string | null;
};

type ClinicRow = {
  id?: string;
  title?: string | null;
  user_id?: string;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
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
    const userId = body.userId;

    if (!isNonEmptyString(userId)) {
      res.status(400).json({ error: 'Usuário inválido' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { data: clinics, error: clinicsError } = await serviceClient
      .from('clinics')
      .select('id,title')
      .eq('user_id', userId);

    if (clinicsError) {
      res.status(400).json({ error: clinicsError.message });
      return;
    }

    const ownerClinicRows = (clinics || []) as ClinicRow[];
    const clinicIds = ownerClinicRows
      .map((c) => c.id)
      .filter((id): id is string => typeof id === 'string');

    let ownerAppointments: Appointment[] = [];
    if (clinicIds.length > 0) {
      const { data, error } = await serviceClient
        .from('appointments')
        .select('*')
        .in('clinic_id', clinicIds);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      ownerAppointments = (data as Appointment[]) || [];
    }

    const { data: selfAppointmentsData, error: selfAppointmentsError } = await serviceClient
      .from('appointments')
      .select('*')
      .eq('user_id', userId);

    if (selfAppointmentsError) {
      res.status(400).json({ error: selfAppointmentsError.message });
      return;
    }

    const selfAppointments = (selfAppointmentsData as Appointment[]) || [];
    const appointmentsById = new Map<string, Appointment>();
    [...ownerAppointments, ...selfAppointments].forEach((appointment) => {
      appointmentsById.set(appointment.id, appointment);
    });

    const appointments = Array.from(appointmentsById.values()).sort((a, b) => {
      if (a.date === b.date) return (a.time || '').localeCompare(b.time || '');
      return a.date.localeCompare(b.date);
    });

    const clinicIdsFromAppointments = Array.from(new Set(appointments.map((a) => a.clinic_id)));
    const { data: allClinicsRows, error: allClinicsError } = await serviceClient
      .from('clinics')
      .select('id,title,user_id,street,number,neighborhood,city,state')
      .in('id', clinicIdsFromAppointments);

    if (allClinicsError) {
      res.status(400).json({ error: allClinicsError.message });
      return;
    }

    const clinicsMap = ((allClinicsRows || []) as ClinicRow[]).reduce<
      Record<string, string>
    >((acc, clinicRow) => {
      if (clinicRow.id && clinicRow.title) {
        acc[clinicRow.id] = clinicRow.title;
      }
      return acc;
    }, {});

    const clinicOwnerIds = Array.from(
      new Set(
        ((allClinicsRows || []) as ClinicRow[])
          .map((clinicRow) => clinicRow.user_id)
          .filter((ownerId): ownerId is string => typeof ownerId === 'string')
      )
    );

    let clinicOwnerNamesMap: Record<string, string> = {};
    let clinicOwnerRows:
      | Array<{ id: string; trade_name?: string | null; company_name?: string | null; cnpj?: string | null }>
      | null = null;
    if (clinicOwnerIds.length > 0) {
      const { data, error: clinicOwnerError } = await serviceClient
        .from('users')
        .select('id,trade_name,company_name,cnpj')
        .in('id', clinicOwnerIds);

      if (clinicOwnerError) {
        res.status(400).json({ error: clinicOwnerError.message });
        return;
      }

      clinicOwnerRows = (data || []) as Array<{
        id: string;
        trade_name?: string | null;
        company_name?: string | null;
        cnpj?: string | null;
      }>;

      clinicOwnerNamesMap = clinicOwnerRows.reduce<
        Record<string, string>
      >((acc, row) => {
        acc[row.id] = row.trade_name || row.company_name || '';
        return acc;
      }, {});
    }

    const clinicOwnerCnpjMap = (clinicOwnerRows || []).reduce<
      Record<string, string>
    >((acc, row) => {
      if (row.cnpj) acc[row.id] = row.cnpj;
      return acc;
    }, {});

    const clinicCompanyNameMap = ((allClinicsRows || []) as ClinicRow[]).reduce<Record<string, string>>(
      (acc, clinicRow) => {
        if (!clinicRow.id || !clinicRow.user_id) return acc;
        acc[clinicRow.id] = clinicOwnerNamesMap[clinicRow.user_id] || '';
        return acc;
      },
      {}
    );

    const clinicCnpjMap = ((allClinicsRows || []) as ClinicRow[]).reduce<Record<string, string>>(
      (acc, clinicRow) => {
        if (!clinicRow.id || !clinicRow.user_id) return acc;
        acc[clinicRow.id] = clinicOwnerCnpjMap[clinicRow.user_id] || '';
        return acc;
      },
      {}
    );

    const clinicAddressMap = ((allClinicsRows || []) as ClinicRow[]).reduce<Record<string, string>>(
      (acc, clinicRow) => {
        if (!clinicRow.id) return acc;
        const streetLine = [clinicRow.street, clinicRow.number].filter(Boolean).join(', ');
        const district = clinicRow.neighborhood || '';
        const cityState = [clinicRow.city, clinicRow.state].filter(Boolean).join(' - ');
        const fullAddress = [streetLine, district, cityState].filter(Boolean).join(' • ');
        acc[clinicRow.id] = fullAddress;
        return acc;
      },
      {}
    );

    const bookerIds = Array.from(new Set(appointments.map((a) => a.user_id)));

    let usersMap: Record<string, Appointment['users']> = {};

    if (bookerIds.length > 0) {
      const { data: usersRows, error: usersError } = await serviceClient
        .from('users')
        .select('id,email,user_type,phone,full_name,company_name,trade_name')
        .in('id', bookerIds);

      if (usersError) {
        res.status(400).json({ error: usersError.message });
        return;
      }

      usersMap = ((usersRows || []) as UserRow[]).reduce<Record<string, Appointment['users']>>(
        (acc, row) => {
          acc[row.id] = {
            id: row.id,
            email: row.email,
            userType: row.user_type,
            phone: row.phone,
            fullName: row.full_name || undefined,
            companyName: row.company_name || undefined,
            tradeName: row.trade_name || undefined
          };
          return acc;
        },
        {}
      );
    }

    const mappedAppointments = appointments.map((appointment) => ({
      ...(appointment as Appointment),
      users: usersMap[appointment.user_id],
      clinic_title: clinicsMap[appointment.clinic_id],
      clinic_company_name: clinicCompanyNameMap[appointment.clinic_id],
      clinic_cnpj: clinicCnpjMap[appointment.clinic_id],
      clinic_address: clinicAddressMap[appointment.clinic_id]
    }));

    res.status(200).json({ data: mappedAppointments as Appointment[] });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar agendamentos'
    });
  }
}
