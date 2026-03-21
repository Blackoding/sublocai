import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { Comment, CommentFormData } from '@/types';

type ApiResponse = {
  comment?: Comment;
  error?: string;
};

type Body = {
  clinicId?: string;
  userId?: string;
  data?: CommentFormData;
  content?: string;
  rating?: number;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isRatingValid = (value: unknown): value is number =>
  typeof value === 'number' && value >= 1 && value <= 5;

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

    const content = body.content ?? body.data?.content;
    const rating = body.rating ?? body.data?.rating;

    if (!isNonEmptyString(clinicId) || !isNonEmptyString(userId) || !isNonEmptyString(content) || !isRatingValid(rating)) {
      res.status(400).json({ error: 'Dados de comentário inválidos' });
      return;
    }

    if (content.trim().length < 10) {
      res.status(400).json({ error: 'Comentário deve ter pelo menos 10 caracteres' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('full_name,company_name,trade_name,avatar')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      res.status(400).json({ error: userError?.message || 'User not found' });
      return;
    }

    const userName = userData.trade_name || userData.company_name || userData.full_name || 'Usuário';
    const userAvatar = userData.avatar || null;

    const record = {
      clinic_id: clinicId,
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      content: content.trim(),
      rating
    };

    const { data, error } = await serviceClient
      .from('comments')
      .insert(record)
      .select('*')
      .single();

    if (error || !data) {
      res.status(400).json({ error: error?.message || 'Failed to add comment' });
      return;
    }

    res.status(201).json({ comment: data as Comment });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao adicionar comentário'
    });
  }
}

