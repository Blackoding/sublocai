import type { NextApiRequest, NextApiResponse } from "next";
import { createServiceRoleSupabaseClient } from "@/config/supabase";

type ApiResponse = {
  data?: {
    companyName: string;
    cnpj: string;
    address: string;
  };
  error?: string;
};

type Body = {
  clinicId?: string;
};

type ClinicRow = {
  user_id?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
};

type OwnerRow = {
  trade_name?: string | null;
  company_name?: string | null;
  cnpj?: string | null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

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
    if (!isNonEmptyString(body.clinicId)) {
      res.status(400).json({ error: "Espaço inválido" });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();
    const { data: clinicRows, error: clinicError } = await serviceClient
      .from("clinics")
      .select("user_id,street,number,neighborhood,city,state")
      .eq("id", body.clinicId)
      .limit(1);

    if (clinicError) {
      res.status(400).json({ error: clinicError.message });
      return;
    }

    const clinicRow = ((clinicRows || []) as ClinicRow[])[0];
    if (!clinicRow?.user_id) {
      res.status(200).json({
        data: {
          companyName: "",
          cnpj: "",
          address: "",
        },
      });
      return;
    }

    const { data: ownerRows, error: ownerError } = await serviceClient
      .from("users")
      .select("trade_name,company_name,cnpj")
      .eq("id", clinicRow.user_id)
      .limit(1);

    if (ownerError) {
      res.status(400).json({ error: ownerError.message });
      return;
    }

    const ownerRow = ((ownerRows || []) as OwnerRow[])[0];
    const address = [
      [clinicRow.street, clinicRow.number].filter(Boolean).join(", "),
      clinicRow.neighborhood || "",
      [clinicRow.city, clinicRow.state].filter(Boolean).join(" - "),
    ]
      .filter(Boolean)
      .join(" • ");

    res.status(200).json({
      data: {
        companyName: ownerRow?.trade_name || ownerRow?.company_name || "",
        cnpj: ownerRow?.cnpj || "",
        address,
      },
    });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao buscar dados da empresa",
    });
  }
}
