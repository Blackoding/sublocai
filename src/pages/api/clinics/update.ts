import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
type ApiResponse = {
  clinic?: unknown;
  error?: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '120mb',
    },
  },
};

type Body = {
  clinicId?: string;
  updates?: Record<string, unknown>;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const parseNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const isAllowedStatus = (value: unknown): value is 'pending' | 'active' | 'inactive' => {
  return value === 'pending' || value === 'active' || value === 'inactive';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const body = req.body as Body;
    const clinicId = body.clinicId;
    const updates = body.updates ?? {};

    if (!isNonEmptyString(clinicId) || updates === null || typeof updates !== 'object') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const updateRecord: Record<string, unknown> = {};

    if (typeof updates.title === 'string') updateRecord.title = updates.title;
    if (typeof updates.description === 'string') updateRecord.description = updates.description;

    if (typeof updates.cep === 'string') updateRecord.cep = updates.cep;
    if (typeof updates.street === 'string') updateRecord.street = updates.street;
    if (typeof updates.number === 'string') updateRecord.number = updates.number;
    if (typeof updates.neighborhood === 'string') updateRecord.neighborhood = updates.neighborhood;
    if (typeof updates.complement === 'string') updateRecord.complement = updates.complement;

    if (typeof updates.city === 'string') updateRecord.city = updates.city;
    if (typeof updates.state === 'string') updateRecord.state = updates.state;

    if (typeof updates.zip_code === 'string') updateRecord.zip_code = updates.zip_code;

    if (typeof updates.price === 'number' || typeof updates.price === 'string') {
      updateRecord.price = parseNumber(updates.price);
    }

    if (typeof updates.specialty === 'string') updateRecord.specialty = updates.specialty;

    if (Array.isArray(updates.specialties)) updateRecord.specialties = normalizeStringArray(updates.specialties);
    if (Array.isArray(updates.images)) updateRecord.images = normalizeStringArray(updates.images);
    if (Array.isArray(updates.features)) updateRecord.features = normalizeStringArray(updates.features);

    if (typeof updates.google_maps_url === 'string') updateRecord.google_maps_url = updates.google_maps_url;

    if (Array.isArray(updates.availability)) updateRecord.availability = updates.availability;

    if (typeof updates.hasappointment === 'boolean') updateRecord.hasappointment = updates.hasappointment;

    if (isAllowedStatus(updates.status)) updateRecord.status = updates.status;

    if (Object.keys(updateRecord).length === 0) {
      res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
      return;
    }

    const { data, error } = await serviceClient
      .from('clinics')
      .update(updateRecord)
      .eq('id', clinicId)
      .select()
      .single();

    if (error || !data) {
      res.status(400).json({ error: error?.message || 'Failed to update clinic' });
      return;
    }

    res.status(200).json({ clinic: data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar clínica'
    });
  }
}

