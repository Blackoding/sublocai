import { useCallback, useState } from "react";
import { normalizeAccessibilityFeatures } from "@/constants/accessibility";
import type { Clinic, ClinicAccessibility } from "@/types";

export interface ClinicsResponse {
  success: boolean;
  clinics?: Clinic[];
  error?: string;
}

export interface ClinicResponse {
  success: boolean;
  clinic?: Clinic;
  error?: string;
}

type ClinicRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  rules?: string | null;
  included_equipment?: string[] | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  complement?: string | null;
  city: string;
  state: string;
  zip_code?: string | null;
  price: number | string;
  price_per_shift?: number | string | null;
  price_per_day?: number | string | null;
  price_per_month?: number | string | null;
  specialty?: string | null;
  specialties?: string[] | null;
  images?: string[] | null;
  features?: string[] | null;
  accessibility_features?: string[] | null;
  google_maps_url?: string | null;
  availability?: unknown;
  hasappointment?: boolean | null;
  status?: string | null;
  views?: number | null;
  bookings?: number | null;
  rating?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const parseNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".");
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const mapClinicRowToClinic = (row: ClinicRow): Clinic => {
  const specialties = Array.isArray(row.specialties) ? row.specialties : [];
  const images = Array.isArray(row.images) ? row.images : [];
  const features = Array.isArray(row.features) ? row.features : [];
  const accessibility_features = normalizeAccessibilityFeatures(
    row.accessibility_features,
  ) as ClinicAccessibility[];
  const included_equipment = Array.isArray(row.included_equipment)
    ? row.included_equipment
        .filter((item): item is string => typeof item === "string")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  const availability = Array.isArray(row.availability)
    ? row.availability
    : undefined;

  const hasAppointment =
    typeof row.hasappointment === "boolean" ? row.hasappointment : undefined;

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    rules: row.rules || undefined,
    included_equipment,
    cep: row.cep || undefined,
    street: row.street || undefined,
    number: row.number || undefined,
    neighborhood: row.neighborhood || undefined,
    complement: row.complement || undefined,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code || undefined,
    price: parseNumber(row.price),
    price_per_shift:
      row.price_per_shift !== null && row.price_per_shift !== undefined
        ? parseNumber(row.price_per_shift)
        : undefined,
    price_per_day:
      row.price_per_day !== null && row.price_per_day !== undefined
        ? parseNumber(row.price_per_day)
        : undefined,
    price_per_month:
      row.price_per_month !== null && row.price_per_month !== undefined
        ? parseNumber(row.price_per_month)
        : undefined,
    specialty: row.specialty || "",
    specialties,
    images,
    features,
    accessibility_features,
    google_maps_url: row.google_maps_url || undefined,
    availability: availability as Clinic["availability"],
    hasAppointment,
    status: (row.status as Clinic["status"]) || undefined,
    views: typeof row.views === "number" ? row.views : undefined,
    bookings: typeof row.bookings === "number" ? row.bookings : undefined,
    rating:
      row.rating !== null && row.rating !== undefined
        ? parseNumber(row.rating)
        : undefined,
    created_at: row.created_at || undefined,
    updated_at: row.updated_at || undefined,
  };
};

const fetchJson = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  const json = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    const msg =
      typeof json?.error === "string" && json.error.trim().length > 0
        ? json.error
        : `Request failed (${response.status})`;
    throw new Error(msg);
  }
  return json;
};

export const useClinic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callCreateClinic = useCallback(
    async (clinicData: Clinic): Promise<ClinicResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await clinicUtils.createClinic(clinicData);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    error,
    createClinic: callCreateClinic,
  };
};

type CreateClinicApiResponse = {
  clinic?: ClinicRow;
  error?: string;
};

type ClinicsApiResponse = {
  clinics?: ClinicRow[];
  error?: string;
};

type DeleteClinicApiResponse = {
  success?: boolean;
  error?: string;
};

type UpdateClinicApiResponse = {
  clinic?: ClinicRow;
  error?: string;
};

export const clinicUtils = {
  async createClinic(clinicData: Clinic): Promise<ClinicResponse> {
    try {
      const json = await fetchJson<CreateClinicApiResponse>(
        "/api/clinics/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clinicData),
        },
      );

      if (!json.clinic) {
        return {
          success: false,
          error: json.error || "Failed to create clinic",
        };
      }

      return { success: true, clinic: mapClinicRowToClinic(json.clinic) };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create clinic";
      return { success: false, error: message };
    }
  },

  async getClinicsByUser(userId: string): Promise<ClinicsResponse> {
    try {
      const json = await fetchJson<ClinicsApiResponse>("/api/clinics/by-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const clinics = json.clinics || [];
      return { success: true, clinics: clinics.map(mapClinicRowToClinic) };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch clinics";
      return { success: false, error: message };
    }
  },

  async getActiveClinics(): Promise<ClinicsResponse> {
    try {
      const json = await fetchJson<ClinicsApiResponse>("/api/clinics/active", {
        method: "GET",
      });

      const clinics = json.clinics || [];
      return { success: true, clinics: clinics.map(mapClinicRowToClinic) };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch active clinics";
      return { success: false, error: message };
    }
  },

  async updateClinic(
    clinicId: string,
    updates: Record<string, unknown>,
  ): Promise<ClinicResponse> {
    try {
      const json = await fetchJson<UpdateClinicApiResponse>(
        "/api/clinics/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clinicId, updates }),
        },
      );

      if (!json.clinic)
        return {
          success: false,
          error: json.error || "Failed to update clinic",
        };
      return { success: true, clinic: mapClinicRowToClinic(json.clinic) };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update clinic";
      return { success: false, error: message };
    }
  },

  async deleteClinic(clinicId: string): Promise<ClinicResponse> {
    try {
      const json = await fetchJson<DeleteClinicApiResponse>(
        "/api/clinics/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clinicId }),
        },
      );

      if (!json.success)
        return {
          success: false,
          error: json.error || "Failed to delete clinic",
        };
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete clinic";
      return { success: false, error: message };
    }
  },
};
