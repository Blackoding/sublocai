import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type AbacatePayload = {
  event?: string;
  data?: Record<string, unknown>;
  devMode?: boolean;
};

type ResponseBody =
  | { success: true }
  | { error: string };

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const addDays = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

const extractUserIdFromExternalId = (externalId: string): string | null => {
  const match = externalId.match(/^sublease-subscription-(basic|pro)-([0-9a-fA-F-]{36})-/);
  if (!match) return null;
  return match[2];
};

const shouldHandleAsPaid = (event: string | undefined, status: string | undefined): boolean => {
  if (!event) return false;
  const normalizedEvent = event.toLowerCase();
  if (normalizedEvent.includes('billing.paid')) return true;
  if (normalizedEvent.includes('subscription.created')) return true;
  if (status && status.toUpperCase() === 'PAID') return true;
  if (normalizedEvent.includes('paid')) return true;
  return false;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const payload = req.body as AbacatePayload;
    const event = payload.event;
    const data = payload.data || {};

    const statusValue = typeof data.status === 'string' ? data.status : undefined;
    if (!shouldHandleAsPaid(event, statusValue)) {
      res.status(200).json({ success: true });
      return;
    }

    const externalId = typeof data.externalId === 'string' ? data.externalId : undefined;
    const resourceId = typeof data.id === 'string' ? data.id : undefined;

    const nextBillingDate = parseDate(data.nextBilling);
    let paidUntil: Date;

    if (nextBillingDate) {
      paidUntil = nextBillingDate;
    } else {
      const createdAtDate = parseDate(data.createdAt) || parseDate(data.updatedAt) || new Date();
      paidUntil = addDays(createdAtDate, 30);
    }

    const paidUntilIso = paidUntil.toISOString();

    const supabase = createServiceRoleSupabaseClient();

    let updated = false;
    const userIdFromExternalId = externalId ? extractUserIdFromExternalId(externalId) : null;

    if (userIdFromExternalId) {
      await supabase
        .from('users')
        .update({
          subscription_paid_until: paidUntilIso,
          subscription_status: 'active'
        })
        .eq('id', userIdFromExternalId);
      if (resourceId) {
        await supabase
          .from('subscription_payments')
          .update({
            status: 'active',
            paid_at: new Date().toISOString(),
            due_at: paidUntilIso
          })
          .eq('provider', 'abacatepay')
          .eq('provider_payment_id', resourceId);
      }
      updated = true;
    } else if (resourceId) {
      const { data: billingUpdatedRows } = await supabase
        .from('users')
        .update({ subscription_paid_until: paidUntilIso, subscription_status: 'active' })
        .eq('abacate_last_billing_id', resourceId)
        .select('id');

      if (billingUpdatedRows && billingUpdatedRows.length > 0) {
        updated = true;
      } else {
        const { data: pixUpdatedRows } = await supabase
          .from('users')
          .update({ subscription_paid_until: paidUntilIso, subscription_status: 'active' })
          .eq('abacate_last_pix_qr_id', resourceId)
          .select('id');

        if (pixUpdatedRows && pixUpdatedRows.length > 0) {
          updated = true;
        }
      }
    }

    if (!updated) {
      res.status(200).json({ success: true });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado no webhook'
    });
  }
}

