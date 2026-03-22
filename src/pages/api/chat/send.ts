import type { NextApiRequest, NextApiResponse } from "next";
import { createServiceRoleSupabaseClient } from "@/config/supabase";
import type { ChatMessage } from "@/types";

type ApiResponse = {
  data?: ChatMessage;
  error?: string;
};

type Body = {
  senderId?: string;
  appointmentId?: string;
  content?: string;
};

type AppointmentRow = {
  id: string;
  user_id: string;
  clinic_id: string;
};

type ClinicRow = {
  id: string;
  user_id: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const containsContactData = (value: string): boolean => {
  const normalized = value.toLowerCase();
  const emailPattern = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
  const phonePattern =
    /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4})[-.\s]?\d{4}\b/;
  const rawDigits = value.replace(/\D/g, "");
  const hasLongDigitSequence = rawDigits.length >= 10;
  return (
    emailPattern.test(normalized) ||
    phonePattern.test(value) ||
    hasLongDigitSequence
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  try {
    const body = req.body as Body;
    const senderId = body.senderId;
    const appointmentId = body.appointmentId;
    const content = body.content;

    if (
      !isNonEmptyString(senderId) ||
      !isNonEmptyString(appointmentId) ||
      !isNonEmptyString(content)
    ) {
      res.status(400).json({ error: "Dados inválidos" });
      return;
    }

    const sanitizedContent = content.trim();

    if (sanitizedContent.length < 1 || sanitizedContent.length > 2000) {
      res.status(400).json({ error: "Mensagem inválida" });
      return;
    }

    if (containsContactData(sanitizedContent)) {
      res
        .status(400)
        .json({
          error: "Não é permitido compartilhar telefone ou e-mail no chat",
        });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { data: appointmentData, error: appointmentError } =
      await serviceClient
        .from("appointments")
        .select("id,user_id,clinic_id")
        .eq("id", appointmentId)
        .single();

    if (appointmentError || !appointmentData) {
      res
        .status(404)
        .json({
          error: appointmentError?.message || "Agendamento não encontrado",
        });
      return;
    }

    const appointment = appointmentData as AppointmentRow;
    const { data: clinicData, error: clinicError } = await serviceClient
      .from("clinics")
      .select("id,user_id")
      .eq("id", appointment.clinic_id)
      .single();

    if (clinicError || !clinicData) {
      res
        .status(404)
        .json({ error: clinicError?.message || "Espaço não encontrado" });
      return;
    }

    const clinic = clinicData as ClinicRow;
    const bookerId = appointment.user_id;
    const clinicOwnerId = clinic.user_id;

    let receiverId = "";
    if (senderId === bookerId) {
      receiverId = clinicOwnerId;
    } else if (senderId === clinicOwnerId) {
      receiverId = bookerId;
    } else {
      res
        .status(403)
        .json({ error: "Sem permissão para enviar mensagem neste chat" });
      return;
    }

    const { data: senderData } = await serviceClient
      .from("users")
      .select("full_name,company_name,trade_name")
      .eq("id", senderId)
      .single();

    const senderName = senderData
      ? senderData.trade_name ||
        senderData.company_name ||
        senderData.full_name ||
        "Usuário"
      : "Usuário";

    const { data: insertedData, error: insertError } = await serviceClient
      .from("appointment_messages")
      .insert({
        appointment_id: appointmentId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: sanitizedContent,
      })
      .select("id,appointment_id,sender_id,receiver_id,content,created_at")
      .single();

    if (insertError || !insertedData) {
      res
        .status(400)
        .json({ error: insertError?.message || "Erro ao enviar mensagem" });
      return;
    }

    const responseData: ChatMessage = {
      id: insertedData.id as string,
      appointmentId: insertedData.appointment_id as string,
      senderId: insertedData.sender_id as string,
      receiverId: insertedData.receiver_id as string,
      content: insertedData.content as string,
      createdAt: insertedData.created_at as string,
      senderName,
    };

    res.status(201).json({ data: responseData });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao enviar mensagem",
    });
  }
}
