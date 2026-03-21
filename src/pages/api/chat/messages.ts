import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { ChatMessage } from '@/types';

type ApiResponse = {
  data?: ChatMessage[];
  error?: string;
};

type Body = {
  userId?: string;
  appointmentId?: string;
};

type AppointmentOwnerRow = {
  id: string;
  user_id: string;
};

type AppointmentRow = {
  id: string;
  user_id: string;
  clinic_id: string;
};

type MessageRow = {
  id: string;
  appointment_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

type UserRow = {
  id: string;
  full_name?: string | null;
  company_name?: string | null;
  trade_name?: string | null;
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
    const appointmentId = body.appointmentId;

    if (!isNonEmptyString(userId) || !isNonEmptyString(appointmentId)) {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { data: appointmentData, error: appointmentError } = await serviceClient
      .from('appointments')
      .select('id,user_id,clinic_id')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointmentData) {
      res.status(404).json({ error: appointmentError?.message || 'Agendamento não encontrado' });
      return;
    }

    const appointment = appointmentData as AppointmentRow;
    const { data: clinicData, error: clinicError } = await serviceClient
      .from('clinics')
      .select('id,user_id')
      .eq('id', appointment.clinic_id)
      .single();

    if (clinicError || !clinicData) {
      res.status(404).json({ error: clinicError?.message || 'Consultório não encontrado' });
      return;
    }

    const clinic = clinicData as AppointmentOwnerRow;
    const isParticipant = appointment.user_id === userId || clinic.user_id === userId;
    if (!isParticipant) {
      res.status(403).json({ error: 'Sem permissão para acessar esta conversa' });
      return;
    }

    const { error: markReadError } = await serviceClient
      .from('appointment_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('appointment_id', appointmentId)
      .eq('receiver_id', userId)
      .is('read_at', null);

    if (markReadError) {
      res.status(400).json({ error: markReadError.message });
      return;
    }

    const { data: messagesRows, error: messagesError } = await serviceClient
      .from('appointment_messages')
      .select('id,appointment_id,sender_id,receiver_id,content,created_at')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      res.status(400).json({ error: messagesError.message });
      return;
    }

    const senderIds = Array.from(
      new Set(((messagesRows || []) as MessageRow[]).map((message) => message.sender_id))
    );

    let usersById: Record<string, UserRow> = {};
    if (senderIds.length > 0) {
      const { data: usersRows, error: usersError } = await serviceClient
        .from('users')
        .select('id,full_name,company_name,trade_name')
        .in('id', senderIds);

      if (usersError) {
        res.status(400).json({ error: usersError.message });
        return;
      }

      usersById = ((usersRows || []) as UserRow[]).reduce<Record<string, UserRow>>((acc, row) => {
        acc[row.id] = row;
        return acc;
      }, {});
    }

    const data: ChatMessage[] = ((messagesRows || []) as MessageRow[]).map((message) => {
      const sender = usersById[message.sender_id];
      const senderName = sender?.trade_name || sender?.company_name || sender?.full_name || 'Usuário';
      return {
        id: message.id,
        appointmentId: message.appointment_id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        content: message.content,
        createdAt: message.created_at,
        senderName
      };
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar mensagens'
    });
  }
}
