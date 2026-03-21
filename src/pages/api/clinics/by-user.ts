import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type ApiResponse = {
  clinics?: unknown[];
  error?: string;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

type Body = {
  userId?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const body = req.body as Body;
    const userId = body.userId;
    if (!isNonEmptyString(userId)) {
      res.status(400).json({ error: 'User ID inválido' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();
    const { data, error } = await serviceClient
      .from('clinics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      res.status(400).json({ error: error?.message || 'Failed to fetch clinics' });
      return;
    }

    res.status(200).json({ clinics: data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar clínicas'
    });
  }
}

