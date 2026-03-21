import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const buildAbacateHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${ABACATEPAY_API_KEY}`
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const userId = req.query.userId;
    const paymentId = req.query.paymentId;

    if (!isNonEmptyString(userId) || !isNonEmptyString(paymentId)) {
      res.status(400).json({ error: 'Parâmetros inválidos' });
      return;
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from('subscription_payments')
      .select(
        'id,payment_method,provider,provider_payment_id'
      )
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: error?.message || 'Pagamento não encontrado' });
      return;
    }

    if (data.provider !== 'abacatepay' || !isNonEmptyString(data.provider_payment_id)) {
      res.status(400).json({ error: 'Comprovante indisponível para este pagamento' });
      return;
    }

    if (!isNonEmptyString(ABACATEPAY_API_KEY)) {
      res.status(500).json({ error: 'AbacatePay não configurado no servidor' });
      return;
    }

    let receiptUrl: string | null = null;

    if (data.payment_method === 'card') {
      const billingResponse = await fetch(`${ABACATEPAY_BASE_URL}/billing/list`, {
        method: 'GET',
        headers: buildAbacateHeaders()
      });

      if (!billingResponse.ok) {
        res.status(400).json({ error: 'Não foi possível consultar o comprovante na AbacatePay' });
        return;
      }

      const billingJson = (await billingResponse.json()) as {
        data?: Array<{
          id?: string;
          receiptUrl?: string | null;
          invoiceUrl?: string | null;
          pdfUrl?: string | null;
        }>;
      };

      const billing = (billingJson.data || []).find((item) => item.id === data.provider_payment_id);
      if (billing) {
        receiptUrl = billing.receiptUrl || billing.invoiceUrl || billing.pdfUrl || null;
      }
    } else {
      const pixResponse = await fetch(
        `${ABACATEPAY_BASE_URL}/pixQrCode/check?id=${encodeURIComponent(data.provider_payment_id)}`,
        {
          method: 'GET',
          headers: buildAbacateHeaders()
        }
      );

      if (!pixResponse.ok) {
        res.status(400).json({ error: 'Não foi possível consultar o comprovante na AbacatePay' });
        return;
      }

      const pixJson = (await pixResponse.json()) as {
        data?: {
          receiptUrl?: string | null;
          invoiceUrl?: string | null;
          pdfUrl?: string | null;
        };
      };

      receiptUrl = pixJson.data?.receiptUrl || pixJson.data?.invoiceUrl || pixJson.data?.pdfUrl || null;
    }

    if (!isNonEmptyString(receiptUrl)) {
      res.status(400).json({
        error: 'A AbacatePay ainda não disponibilizou o comprovante PDF para este pagamento'
      });
      return;
    }

    const receiptResponse = await fetch(receiptUrl);
    if (receiptResponse.ok) {
      const contentType = receiptResponse.headers.get('content-type') || '';
      if (contentType.toLowerCase().includes('application/pdf')) {
        const arrayBuffer = await receiptResponse.arrayBuffer();
        const fileName = `comprovante-abacatepay-${data.provider_payment_id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(200).send(Buffer.from(arrayBuffer));
        return;
      }
    }

    res.redirect(302, receiptUrl);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao gerar comprovante'
    });
  }
}
