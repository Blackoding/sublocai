import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type ApiResponse = {
  success?: boolean;
  error?: string;
};

type Body = {
  clinicId?: string;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const body = req.body as Body;
    const clinicId = body.clinicId;

    if (!isNonEmptyString(clinicId)) {
      res.status(400).json({ error: 'clinicId inválido' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { error } = await serviceClient.from('clinics').delete().eq('id', clinicId);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao excluir clínica'
    });
  }
}

