import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type Body = {
  userId?: string;
};

type HistoryItem = {
  id: string;
  planEmpresa: 'basic' | 'pro';
  paymentMethod: 'pix' | 'card';
  amountCents: number;
  status: 'pending_payment' | 'active' | 'inactive' | 'failed';
  paidAt: string | null;
  dueAt: string | null;
  createdAt: string;
};

type ApiResponse =
  | {
      data: HistoryItem[];
      error?: undefined;
    }
  | {
      error: string;
      data?: undefined;
    };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPlanEmpresa = (value: unknown): value is 'basic' | 'pro' =>
  value === 'basic' || value === 'pro';

const isPaymentMethod = (value: unknown): value is 'pix' | 'card' => value === 'pix' || value === 'card';

const isPaymentStatus = (
  value: unknown
): value is 'pending_payment' | 'active' | 'inactive' | 'failed' =>
  value === 'pending_payment' || value === 'active' || value === 'inactive' || value === 'failed';

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
    if (!isNonEmptyString(body.userId)) {
      res.status(400).json({ error: 'Usuário não informado' });
      return;
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from('subscription_payments')
      .select('id,plan_empresa,payment_method,amount_cents,status,paid_at,due_at,created_at')
      .eq('user_id', body.userId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message || 'Erro ao buscar histórico de pagamentos' });
      return;
    }

    const items: HistoryItem[] = (data || []).map((row) => ({
      id: row.id,
      planEmpresa: isPlanEmpresa(row.plan_empresa) ? row.plan_empresa : 'basic',
      paymentMethod: isPaymentMethod(row.payment_method) ? row.payment_method : 'pix',
      amountCents: typeof row.amount_cents === 'number' ? row.amount_cents : 0,
      status: isPaymentStatus(row.status) ? row.status : 'pending_payment',
      paidAt: row.paid_at || null,
      dueAt: row.due_at || null,
      createdAt: row.created_at
    }));

    res.status(200).json({ data: items });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar pagamentos'
    });
  }
}
