import type { NextApiRequest, NextApiResponse } from "next";
import { createServiceRoleSupabaseClient } from "@/config/supabase";
import { normalizeAccessibilityFeatures } from "@/constants/accessibility";
import { parseOptionalPriceField } from "@/constants/clinicPricing";
import type { Clinic } from "@/types";

type ApiResponse = {
  clinic?: unknown;
  error?: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "120mb",
    },
  },
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeIncludedEquipment = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

type ClinicRequestBody = Partial<Clinic> & {
  user_id?: string;
  hasappointment?: boolean;
  hasAppointment?: boolean;
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
    const body = req.body as ClinicRequestBody;

    const userId = body.user_id;
    const title = body.title;
    const description = body.description;
    const city = body.city;
    const state = body.state;
    const price = body.price;

    if (
      !isNonEmptyString(userId) ||
      !isNonEmptyString(title) ||
      !isNonEmptyString(description) ||
      !isNonEmptyString(city) ||
      !isNonEmptyString(state) ||
      typeof price !== "number"
    ) {
      res.status(400).json({ error: "Dados da clínica inválidos" });
      return;
    }

    const specialties = Array.isArray(body.specialties) ? body.specialties : [];
    const images = Array.isArray(body.images) ? body.images : [];
    const features = Array.isArray(body.features) ? body.features : [];
    const availability = Array.isArray(body.availability)
      ? body.availability
      : [];

    const hasappointment = body.hasappointment ?? body.hasAppointment ?? true;

    const serviceClient = createServiceRoleSupabaseClient();

    const { data: userRow, error: userError } = await serviceClient
      .from("users")
      .select("id,user_type,plan_empresa")
      .eq("id", userId)
      .single();

    if (userError || !userRow) {
      res
        .status(404)
        .json({ error: userError?.message || "Usuário não encontrado" });
      return;
    }

    if (userRow.user_type !== "company") {
      res.status(403).json({ error: "Apenas empresas podem criar espaços" });
      return;
    }

    const { data: clinicsRows, error: clinicsError } = await serviceClient
      .from("clinics")
      .select("id")
      .eq("user_id", userId);

    if (clinicsError) {
      res.status(400).json({ error: clinicsError.message });
      return;
    }

    const planEmpresa = (userRow.plan_empresa || "free") as
      | "free"
      | "basic"
      | "pro"
      | string;
    const maxClinics = planEmpresa === "pro" ? 999 : 1;
    const clinicsCount = Array.isArray(clinicsRows) ? clinicsRows.length : 0;

    if (clinicsCount >= maxClinics) {
      res.status(403).json({
        error: "Você excedeu o limite de salas do seu plano.",
      });
      return;
    }

    const rulesText =
      typeof body.rules === "string" ? body.rules.trim() || null : null;
    const included_equipment = normalizeIncludedEquipment(
      body.included_equipment,
    );
    const accessibility_features = normalizeAccessibilityFeatures(
      body.accessibility_features,
    );
    const price_per_shift = parseOptionalPriceField(body.price_per_shift);
    const price_per_day = parseOptionalPriceField(body.price_per_day);
    const price_per_month = parseOptionalPriceField(body.price_per_month);

    const record: Record<string, unknown> = {
      user_id: userId,
      title,
      description,
      rules: rulesText,
      included_equipment,
      cep: body.cep || undefined,
      street: body.street || undefined,
      number: body.number || undefined,
      neighborhood: body.neighborhood || undefined,
      complement: body.complement || undefined,
      city,
      state,
      zip_code: body.zip_code || undefined,
      price,
      specialty: body.specialty || undefined,
      specialties,
      images,
      features,
      accessibility_features,
      google_maps_url: body.google_maps_url || undefined,
      availability,
      hasappointment,
      status: body.status || "pending",
    };

    if (price_per_shift !== null) record.price_per_shift = price_per_shift;
    if (price_per_day !== null) record.price_per_day = price_per_day;
    if (price_per_month !== null) record.price_per_month = price_per_month;

    const { data, error } = await serviceClient
      .from("clinics")
      .insert(record)
      .select()
      .single();

    if (error || !data) {
      res
        .status(400)
        .json({ error: error?.message || "Failed to create clinic" });
      return;
    }

    res.status(201).json({ clinic: data });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar clínica",
    });
  }
}
