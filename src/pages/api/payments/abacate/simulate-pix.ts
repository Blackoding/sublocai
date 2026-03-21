import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';

type Body = {
  userId?: string;
  pixQrCodeId?: string;
};

type ApiResponse =
  | {
      data: {
        success: true;
        pixQrCodeId: string;
      };
      error?: undefined;
    }
  | {
      error: string;
      data?: undefined;
    };

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';

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

  if (!isNonEmptyString(ABACATEPAY_API_KEY)) {
    res.status(500).json({ error: 'AbacatePay não configurado no servidor' });
    return;
  }

  try {
    const body = req.body as Body;
    if (!isNonEmptyString(body.userId)) {
      res.status(400).json({ error: 'Usuário não informado' });
      return;
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('abacate_last_pix_qr_id')
      .eq('id', body.userId)
      .single();

    if (userError || !userRow) {
      res.status(404).json({ error: userError?.message || 'Usuário não encontrado' });
      return;
    }

    const pixQrCodeId = isNonEmptyString(body.pixQrCodeId)
      ? body.pixQrCodeId
      : userRow.abacate_last_pix_qr_id;

    if (!isNonEmptyString(pixQrCodeId)) {
      res.status(400).json({ error: 'QR Code Pix não encontrado para simulação' });
      return;
    }

    const response = await fetch(
      `${ABACATEPAY_BASE_URL}/pixQrCode/simulate-payment?id=${encodeURIComponent(pixQrCodeId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ABACATEPAY_API_KEY}`
        },
        body: JSON.stringify({})
      }
    );

    const json = (await response.json()) as {
      error?: string | { message?: string } | null;
    };

    if (!response.ok) {
      const errorMessage =
        typeof json.error === 'string'
          ? json.error
          : json.error?.message || 'Erro ao simular pagamento Pix';
      res.status(400).json({ error: errorMessage });
      return;
    }

    res.status(200).json({
      data: {
        success: true,
        pixQrCodeId
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado ao simular pagamento Pix'
    });
  }
}

