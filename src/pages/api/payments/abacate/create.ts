import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type PlanEmpresa = 'basic' | 'pro';
type PaymentMethod = 'pix' | 'card';

type Body = {
  plan?: PlanEmpresa;
  method?: PaymentMethod;
  userId?: string;
};

type ApiResponse =
  | {
      data: {
        method: 'card';
        checkoutUrl: string;
        billingId?: string;
      };
      error?: undefined;
    }
  | {
      data: {
        method: 'pix';
        pixQrCodeId: string;
        brCode: string;
        brCodeBase64: string;
        expiresAt?: string;
      };
      error?: undefined;
    }
  | {
      error: string;
      data?: undefined;
    };

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';
const BASIC_PLAN_EXTERNAL_ID = 'prod_6LMMkDqH3hZ5qqcCKgCEcW5k';
const PRO_PLAN_EXTERNAL_ID = 'prod_TUgXZjDwxauUU06CwsM5e6k1';
const BASIC_AMOUNT_CENTS = 3900;
const PRO_AMOUNT_CENTS = 7900;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPlanEmpresa = (value: unknown): value is PlanEmpresa =>
  value === 'basic' || value === 'pro';

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  value === 'pix' || value === 'card';

type UserRow = {
  id: string;
  email: string;
  user_type: 'professional' | 'company';
  phone: string;
  full_name: string | null;
  cpf: string | null;
  company_name: string | null;
  trade_name: string | null;
  cnpj: string | null;
  responsible_name: string | null;
  responsible_cpf: string | null;
};

const getAbacateCustomerFromUserRow = (userRow: UserRow): {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
} => {
  const name =
    userRow.user_type === 'company'
      ? userRow.trade_name || userRow.company_name || userRow.responsible_name || 'Empresa'
      : userRow.full_name || 'Usuário';

  const taxId =
    userRow.user_type === 'company'
      ? userRow.cnpj || userRow.responsible_cpf || ''
      : userRow.cpf || '';

  return {
    name,
    cellphone: userRow.phone,
    email: userRow.email,
    taxId
  };
};

const getPlanExternalIdByPlan = (plan: PlanEmpresa): string => {
  if (plan === 'basic') return BASIC_PLAN_EXTERNAL_ID;
  return PRO_PLAN_EXTERNAL_ID;
};

const getAmountByPlan = (plan: PlanEmpresa): number => {
  if (plan === 'basic') return BASIC_AMOUNT_CENTS;
  return PRO_AMOUNT_CENTS;
};

const getBaseUrlFromRequest = (req: NextApiRequest): string => {
  const host = req.headers.host;
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto =
    typeof forwardedProto === 'string' && forwardedProto.length > 0
      ? forwardedProto
      : 'https';

  if (!host) return `${proto}://localhost:3000`;
  return `${proto}://${host}`;
};

const buildRequestHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ABACATEPAY_API_KEY}`
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

  if (!isNonEmptyString(ABACATEPAY_API_KEY)) {
    res.status(500).json({ error: 'AbacatePay não configurado no servidor' });
    return;
  }

  try {
    const body = req.body as Body;
    const plan = body.plan;
    const method = body.method;
    const userId = body.userId;

    if (!isPlanEmpresa(plan) || !isPaymentMethod(method)) {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }

    if (!isNonEmptyString(userId)) {
      res.status(400).json({ error: 'Faça login para gerar o pagamento da assinatura.' });
      return;
    }

    const serviceClient = createServiceRoleSupabaseClient();

    let abacateCustomer:
      | {
          name: string;
          cellphone: string;
          email: string;
          taxId: string;
        }
      | null = null;

    const { data: userRow, error: userError } = await serviceClient
      .from('users')
      .select(
        'id,email,user_type,phone,full_name,cpf,company_name,trade_name,cnpj,responsible_name,responsible_cpf'
      )
      .eq('id', userId)
      .single();

    if (userError || !userRow) {
      res.status(404).json({ error: userError?.message || 'Usuário não encontrado' });
      return;
    }

    const customer = getAbacateCustomerFromUserRow(userRow as UserRow);
    if (!customer.taxId || customer.taxId.trim().length === 0) {
      res.status(400).json({ error: 'CPF/CNPJ do usuário não configurado para pagamento.' });
      return;
    }
    abacateCustomer = customer;

    if (method === 'card') {
      const baseUrl = getBaseUrlFromRequest(req);
      const externalId = isNonEmptyString(userId)
        ? `sublease-subscription-${plan}-${userId}-${Date.now()}`
        : `sublease-subscription-${plan}-${Date.now()}`;
      const payload = {
        frequency: 'MULTIPLE_PAYMENTS',
        methods: ['CARD'],
        products: [
          {
            externalId: getPlanExternalIdByPlan(plan),
            name: plan === 'basic' ? 'Assinatura Básico' : 'Assinatura Profissional',
            description:
              plan === 'basic'
                ? 'Assinatura recorrente do plano Básico.'
                : 'Assinatura recorrente do plano Profissional.',
            quantity: 1,
            price: getAmountByPlan(plan)
          }
        ],
        returnUrl: `${baseUrl}/painel-de-controle`,
        completionUrl: `${baseUrl}/painel-de-controle`,
        externalId,
        metadata: {
          source: 'sublease-signature-page',
          plan,
          userId
        }
      };

      Object.assign(payload, { customer: abacateCustomer });

      const response = await fetch(`${ABACATEPAY_BASE_URL}/billing/create`, {
        method: 'POST',
        headers: buildRequestHeaders(),
        body: JSON.stringify(payload)
      });

      const json = (await response.json()) as {
        data?: { id?: string; url?: string };
        error?: { message?: string } | string | null;
      };

      if (!response.ok || !json.data?.url) {
        const errorMessage =
          typeof json.error === 'string'
            ? json.error
            : json.error?.message || 'Erro ao criar checkout de assinatura';
        res.status(400).json({ error: errorMessage });
        return;
      }

      if (json.data.id) {
        await serviceClient
          .from('users')
          .update({
            abacate_last_billing_id: json.data.id,
            abacate_last_plan_empresa: plan,
            subscription_status: 'pending_payment'
          })
          .eq('id', userId);

        await serviceClient
          .from('subscription_payments')
          .insert({
            user_id: userId,
            plan_empresa: plan,
            payment_method: 'card',
            provider: 'abacatepay',
            provider_payment_id: json.data.id,
            provider_external_id: externalId,
            amount_cents: getAmountByPlan(plan),
            status: 'pending_payment',
            metadata: {
              source: 'signature-page',
              returnUrl: payload.returnUrl,
              completionUrl: payload.completionUrl
            }
          });
      }

      res.status(200).json({
        data: {
          method: 'card',
          checkoutUrl: json.data.url,
          billingId: json.data.id
        }
      });
      return;
    }

    const pixPayload = {
      amount: getAmountByPlan(plan),
      expiresIn: 3600,
      description:
        plan === 'basic' ? 'Assinatura Básico - Sublease' : 'Assinatura Profissional - Sublease',
      metadata: {
        source: 'sublease-signature-page',
        plan,
        userId
      },
      customer: {
        name: abacateCustomer.name,
        cellphone: abacateCustomer.cellphone,
        email: abacateCustomer.email,
        taxId: abacateCustomer.taxId
      }
    };

    const pixResponse = await fetch(`${ABACATEPAY_BASE_URL}/pixQrCode/create`, {
      method: 'POST',
      headers: buildRequestHeaders(),
      body: JSON.stringify(pixPayload)
    });

    const pixJson = (await pixResponse.json()) as {
      data?: {
        id?: string;
        brCode?: string;
        brCodeBase64?: string;
        expiresAt?: string;
      };
      error?: { message?: string } | string | null;
    };

    if (
      !pixResponse.ok ||
      !pixJson.data?.id ||
      !pixJson.data?.brCode ||
      !pixJson.data?.brCodeBase64
    ) {
      const errorMessage =
        typeof pixJson.error === 'string'
          ? pixJson.error
          : pixJson.error?.message || 'Erro ao criar QR Code Pix';
      res.status(400).json({ error: errorMessage });
      return;
    }

    if (pixJson.data.id) {
      await serviceClient
        .from('users')
        .update({
          abacate_last_pix_qr_id: pixJson.data.id,
          abacate_last_plan_empresa: plan,
          subscription_status: 'pending_payment'
        })
        .eq('id', userId);

      await serviceClient
        .from('subscription_payments')
        .insert({
          user_id: userId,
          plan_empresa: plan,
          payment_method: 'pix',
          provider: 'abacatepay',
          provider_payment_id: pixJson.data.id,
          amount_cents: getAmountByPlan(plan),
          status: 'pending_payment',
          due_at: pixJson.data.expiresAt || null,
          metadata: {
            source: 'signature-page'
          }
        });
    }

    res.status(200).json({
      data: {
        method: 'pix',
        pixQrCodeId: pixJson.data.id,
        brCode: pixJson.data.brCode,
        brCodeBase64: pixJson.data.brCodeBase64,
        expiresAt: pixJson.data.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao integrar com AbacatePay'
    });
  }
}
