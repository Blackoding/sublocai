import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type ApiResponse = {
  success?: boolean;
  error?: string;
};

type Body = {
  commentId?: string;
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
    const commentId = body.commentId;
    const userId = body.userId;

    if (!isNonEmptyString(commentId) || !isNonEmptyString(userId)) {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { error } = await serviceClient
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao excluir comentário'
    });
  }
}

