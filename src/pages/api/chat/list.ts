import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { Appointment, ChatThread } from '@/types';

type ApiResponse = {
  data?: ChatThread[];
  error?: string;
};

type Body = {
  userId?: string;
};

type AppointmentRow = Appointment;

type UserRow = {
  id: string;
  user_type: 'professional' | 'company';
  full_name?: string | null;
  company_name?: string | null;
  trade_name?: string | null;
};

type ClinicRow = {
  id: string;
  title?: string | null;
  user_id: string;
};

type MessageRow = {
  appointment_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
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

    const { data: currentUserData, error: currentUserError } = await serviceClient
      .from('users')
      .select('id,user_type')
      .eq('id', userId)
      .single();

    if (currentUserError || !currentUserData) {
      res.status(400).json({ error: currentUserError?.message || 'Usuário não encontrado' });
      return;
    }

    const currentUserType = (currentUserData as { user_type: 'professional' | 'company' }).user_type;

    const { data: clinicsData, error: clinicsError } = await serviceClient
      .from('clinics')
      .select('id,user_id')
      .eq('user_id', userId);

    if (clinicsError) {
      res.status(400).json({ error: clinicsError.message });
      return;
    }

    const ownerClinicIds = ((clinicsData || []) as Array<{ id: string }>)
      .map((clinic) => clinic.id)
      .filter((clinicId): clinicId is string => isNonEmptyString(clinicId));

    let ownerAppointments: AppointmentRow[] = [];
    if (ownerClinicIds.length > 0) {
      const { data, error } = await serviceClient
        .from('appointments')
        .select('*')
        .in('clinic_id', ownerClinicIds);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      ownerAppointments = (data as AppointmentRow[]) || [];
    }

    const { data: selfAppointmentsData, error: selfAppointmentsError } = await serviceClient
      .from('appointments')
      .select('*')
      .eq('user_id', userId);

    if (selfAppointmentsError) {
      res.status(400).json({ error: selfAppointmentsError.message });
      return;
    }

    const selfAppointments = (selfAppointmentsData as AppointmentRow[]) || [];
    const appointmentsMap = new Map<string, AppointmentRow>();
    [...ownerAppointments, ...selfAppointments].forEach((appointment) => {
      appointmentsMap.set(appointment.id, appointment);
    });
    const appointments = Array.from(appointmentsMap.values());

    if (appointments.length === 0) {
      res.status(200).json({ data: [] });
      return;
    }

    const clinicIds = Array.from(new Set(appointments.map((appointment) => appointment.clinic_id)));
    const { data: clinicsRows, error: clinicsRowsError } = await serviceClient
      .from('clinics')
      .select('id,title,user_id')
      .in('id', clinicIds);

    if (clinicsRowsError) {
      res.status(400).json({ error: clinicsRowsError.message });
      return;
    }

    const clinicsById = ((clinicsRows || []) as ClinicRow[]).reduce<Record<string, ClinicRow>>((acc, row) => {
      acc[row.id] = row;
      return acc;
    }, {});

    const userIdsForLookup = Array.from(
      new Set([
        ...appointments.map((appointment) => appointment.user_id),
        ...((clinicsRows || []) as ClinicRow[]).map((clinic) => clinic.user_id)
      ])
    );

    const { data: usersRows, error: usersRowsError } = await serviceClient
      .from('users')
      .select('id,user_type,full_name,company_name,trade_name')
      .in('id', userIdsForLookup);

    if (usersRowsError) {
      res.status(400).json({ error: usersRowsError.message });
      return;
    }

    const usersById = ((usersRows || []) as UserRow[]).reduce<Record<string, UserRow>>((acc, row) => {
      acc[row.id] = row;
      return acc;
    }, {});

    const appointmentIds = appointments.map((appointment) => appointment.id);
    const { data: messagesRows, error: messagesError } = await serviceClient
      .from('appointment_messages')
      .select('appointment_id,sender_id,receiver_id,content,created_at')
      .in('appointment_id', appointmentIds)
      .order('created_at', { ascending: false });

    if (messagesError) {
      res.status(400).json({ error: messagesError.message });
      return;
    }

    const latestMessageByAppointment = new Map<string, MessageRow>();
    ((messagesRows || []) as MessageRow[]).forEach((message) => {
      if (!latestMessageByAppointment.has(message.appointment_id)) {
        latestMessageByAppointment.set(message.appointment_id, message);
      }
    });

    const unreadByAppointment = ((messagesRows || []) as MessageRow[]).reduce<Record<string, number>>((acc, message) => {
      if (message.receiver_id === userId) {
        const currentCount = acc[message.appointment_id] || 0;
        acc[message.appointment_id] = currentCount + 1;
      }
      return acc;
    }, {});

    const data: ChatThread[] = appointments.map((appointment) => {
      const clinic = clinicsById[appointment.clinic_id];
      const clinicOwnerId = clinic?.user_id || '';
      const bookerId = appointment.user_id;
      const counterpartId = currentUserType === 'company' ? bookerId : clinicOwnerId;
      const counterpartUser = usersById[counterpartId];
      const counterpartName = currentUserType === 'company'
        ? counterpartUser?.full_name || 'Profissional'
        : counterpartUser?.trade_name || counterpartUser?.company_name || 'Empresa';
      const counterpartTypeLabel = (currentUserType === 'company' ? 'Profissional' : 'Empresa') as ChatThread['counterpartTypeLabel'];
      const latestMessage = latestMessageByAppointment.get(appointment.id);

      return {
        appointmentId: appointment.id,
        clinicId: appointment.clinic_id,
        clinicTitle: clinic?.title || appointment.clinic_title || 'Consultório',
        counterpartId,
        counterpartName,
        counterpartTypeLabel,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        appointmentStatus: appointment.status,
        latestMessage: latestMessage
          ? {
              content: latestMessage.content,
              createdAt: latestMessage.created_at,
              senderId: latestMessage.sender_id
            }
          : undefined,
        unreadCount: unreadByAppointment[appointment.id] || 0
      };
    });

    data.sort((a, b) => {
      const aKey = a.latestMessage?.createdAt || `${a.appointmentDate}T${a.appointmentTime}`;
      const bKey = b.latestMessage?.createdAt || `${b.appointmentDate}T${b.appointmentTime}`;
      return bKey.localeCompare(aKey);
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar chats'
    });
  }
}
