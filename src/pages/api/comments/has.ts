import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { Comment } from '@/types';

type ApiResponse = {
  comment?: Comment | null;
  error?: string;
};

type Body = {
  clinicId?: string;
  userId?: string;
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
    const clinicId = body.clinicId;
    const userId = body.userId;

    if (!isNonEmptyString(clinicId) || !isNonEmptyString(userId)) {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { data, error } = await serviceClient
      .from('comments')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    const comment = (Array.isArray(data) && data.length > 0 ? data[0] : null) as Comment | null;
    res.status(200).json({ comment });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao verificar comentário'
    });
  }
}

