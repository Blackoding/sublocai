import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { User } from '@/types';

type ApiResponse =
  | {
      data: {
        showWarning: boolean;
        message: string | null;
        paymentPlan: 'basic' | 'pro';
        paidUntil: string | null;
        overdueDays: number | null;
        subscriptionStatus: 'active' | 'inactive' | 'pending_payment';
      };
      error?: undefined;
    }
  | {
      error: string;
      data?: undefined;
    };

type Body = {
  userId?: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPlan = (value: unknown): value is 'basic' | 'pro' => value === 'basic' || value === 'pro';
const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';

const buildAbacateHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${ABACATEPAY_API_KEY}`
});

const computeSubscriptionState = (subscriptionStatus: 'active' | 'inactive' | 'pending_payment') => {
  if (subscriptionStatus === 'active') {
    return {
      showWarning: false,
      overdueDays: null,
      message: null,
      subscriptionStatus: 'active' as const
    };
  }

  if (subscriptionStatus === 'pending_payment') {
    return {
      showWarning: true,
      overdueDays: null,
      message: 'Assinatura pendente. Regularize seu pagamento para continuar.',
      subscriptionStatus: 'pending_payment' as const
    };
  }

  return {
    showWarning: true,
    overdueDays: null,
    message: 'Assinatura inativa. Regularize seu pagamento para continuar.',
    subscriptionStatus: 'inactive' as const
  };
};

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
    if (!isNonEmptyString(userId)) {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data: userRow, error } = await supabase
      .from('users')
      .select('plan_empresa,subscription_status,subscription_paid_until,abacate_last_billing_id,abacate_last_pix_qr_id')
      .eq('id', userId)
      .single();

    if (error || !userRow) {
      res.status(404).json({ error: error?.message || 'Usuário não encontrado' });
      return;
    }

    const planEmpresa = (userRow.plan_empresa as User['planEmpresa']) || 'free';
    if (planEmpresa === 'free') {
      await supabase
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('id', userId);
      res.status(200).json({
        data: {
          showWarning: false,
          message: null,
          paymentPlan: 'basic',
          paidUntil: userRow.subscription_paid_until || null,
          overdueDays: null,
          subscriptionStatus: 'active'
        }
      });
      return;
    }

    const currentPaidUntil = userRow.subscription_paid_until || null;
    let refreshedPaidUntil = currentPaidUntil;
    let refreshedSubscriptionStatus: 'active' | 'inactive' | 'pending_payment' =
      userRow.subscription_status === 'active' ||
      userRow.subscription_status === 'inactive' ||
      userRow.subscription_status === 'pending_payment'
        ? userRow.subscription_status
        : 'inactive';

    if (isNonEmptyString(ABACATEPAY_API_KEY)) {
      if (userRow.abacate_last_billing_id) {
        const billingResponse = await fetch(`${ABACATEPAY_BASE_URL}/billing/list`, {
          method: 'GET',
          headers: buildAbacateHeaders()
        });

        if (billingResponse.ok) {
          const billingJson = (await billingResponse.json()) as {
            data?: Array<{
              id?: string;
              status?: string;
              nextBilling?: string | null;
              updatedAt?: string;
              createdAt?: string;
            }>;
          };

          const currentBilling = (billingJson.data || []).find(
            (item) => item.id === userRow.abacate_last_billing_id
          );

          if (currentBilling && currentBilling.status?.toUpperCase() === 'PAID') {
            const nextBilling = currentBilling.nextBilling ? new Date(currentBilling.nextBilling) : null;
            const fallbackDate = new Date(
              currentBilling.updatedAt || currentBilling.createdAt || new Date().toISOString()
            );
            const paidUntilDate =
              nextBilling && !Number.isNaN(nextBilling.getTime())
                ? nextBilling
                : new Date(fallbackDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            refreshedPaidUntil = paidUntilDate.toISOString();
            refreshedSubscriptionStatus = 'active';

            await supabase
              .from('subscription_payments')
              .update({
                status: 'active',
                paid_at: new Date().toISOString(),
                due_at: refreshedPaidUntil
              })
              .eq('provider', 'abacatepay')
              .eq('provider_payment_id', userRow.abacate_last_billing_id);
          }
        }
      }

      if (userRow.abacate_last_pix_qr_id) {
        const pixResponse = await fetch(
          `${ABACATEPAY_BASE_URL}/pixQrCode/check?id=${encodeURIComponent(userRow.abacate_last_pix_qr_id)}`,
          {
            method: 'GET',
            headers: buildAbacateHeaders()
          }
        );

        if (pixResponse.ok) {
          const pixJson = (await pixResponse.json()) as {
            data?: {
              status?: string;
              updatedAt?: string;
              createdAt?: string;
            };
          };

          if (pixJson.data?.status?.toUpperCase() === 'PAID') {
            const fallbackDate = new Date(
              pixJson.data.updatedAt || pixJson.data.createdAt || new Date().toISOString()
            );
            const paidUntilDate = new Date(fallbackDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            refreshedPaidUntil = paidUntilDate.toISOString();
            refreshedSubscriptionStatus = 'active';

            await supabase
              .from('subscription_payments')
              .update({
                status: 'active',
                paid_at: new Date().toISOString(),
                due_at: refreshedPaidUntil
              })
              .eq('provider', 'abacatepay')
              .eq('provider_payment_id', userRow.abacate_last_pix_qr_id);
          }
        }
      }
    }

    if (refreshedPaidUntil && refreshedPaidUntil !== currentPaidUntil) {
      await supabase
        .from('users')
        .update({ subscription_paid_until: refreshedPaidUntil })
        .eq('id', userId);
    }

    if (refreshedSubscriptionStatus !== userRow.subscription_status) {
      await supabase
        .from('users')
        .update({ subscription_status: refreshedSubscriptionStatus })
        .eq('id', userId);
    }

    const latestProviderId = userRow.abacate_last_billing_id || userRow.abacate_last_pix_qr_id;
    if (latestProviderId) {
      await supabase
        .from('subscription_payments')
        .update({ status: refreshedSubscriptionStatus })
        .eq('provider', 'abacatepay')
        .eq('provider_payment_id', latestProviderId);
    }
    const state = computeSubscriptionState(refreshedSubscriptionStatus);
    const paymentPlan: 'basic' | 'pro' = isPlan(planEmpresa) ? planEmpresa : 'basic';

    res.status(200).json({
      data: {
        showWarning: state.showWarning,
        message: state.message,
        paymentPlan,
        paidUntil: refreshedPaidUntil,
        overdueDays: state.overdueDays,
        subscriptionStatus: state.subscriptionStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao consultar assinatura'
    });
  }
}

