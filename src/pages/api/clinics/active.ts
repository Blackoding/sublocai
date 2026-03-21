import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type ApiResponse = {
  clinics?: unknown[];
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const serviceClient = createServiceRoleSupabaseClient();
    const { data, error } = await serviceClient
      .from('clinics')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      res.status(400).json({ error: error?.message || 'Failed to fetch active clinics' });
      return;
    }

    res.status(200).json({ clinics: data });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar clínicas ativas'
    });
  }
}

