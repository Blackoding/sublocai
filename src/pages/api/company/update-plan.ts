import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type ApiResponse = {
  success?: boolean;
  error?: string;
};

type Body = {
  userId?: string;
  planEmpresa?: 'basic' | 'free' | 'pro';
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPlanEmpresa = (value: unknown): value is Body['planEmpresa'] =>
  value === 'basic' || value === 'free' || value === 'pro';

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
    const userId = body.userId;
    const planEmpresa = body.planEmpresa;

    if (!isNonEmptyString(userId) || !isPlanEmpresa(planEmpresa)) {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const { data: userRow, error: userError } = await serviceClient
      .from('users')
      .select('id,user_type')
      .eq('id', userId)
      .single();

    if (userError || !userRow) {
      res.status(404).json({ error: userError?.message || 'Usuário não encontrado' });
      return;
    }

    if (userRow.user_type !== 'company') {
      res.status(403).json({ error: 'Apenas empresas podem alterar o plano' });
      return;
    }

    const { error: updateError } = await serviceClient
      .from('users')
      .update({ plan_empresa: planEmpresa })
      .eq('id', userId);

    if (updateError) {
      res.status(400).json({ error: updateError.message });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar plano'
    });
  }
}

