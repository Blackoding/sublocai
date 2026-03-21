import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/Button';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

type PaymentHistoryItem = {
  id: string;
  planEmpresa: 'basic' | 'pro';
  paymentMethod: 'pix' | 'card';
  amountCents: number;
  status: 'pending_payment' | 'active' | 'inactive' | 'failed';
  paidAt: string | null;
  dueAt: string | null;
  createdAt: string;
};

const formatCurrency = (valueInCents: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valueInCents / 100);

const formatDate = (value: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
};

const planLabel: Record<'basic' | 'pro', string> = {
  basic: 'Básico',
  pro: 'Avançado'
};

const methodLabel: Record<'pix' | 'card', string> = {
  pix: 'PIX',
  card: 'Cartão'
};

const statusLabel: Record<'pending_payment' | 'active' | 'inactive' | 'failed', string> = {
  pending_payment: 'Pagamento pendente',
  active: 'Ativo',
  inactive: 'Inativo',
  failed: 'Falhou'
};

const statusClassName: Record<'pending_payment' | 'active' | 'inactive' | 'failed', string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-200 text-gray-700',
  failed: 'bg-red-100 text-red-700'
};

const MinhaAssinaturaPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);

  const canAccessPage = useMemo(() => {
    return isAuthenticated && user?.userType === 'company' && !!user.id;
  }, [isAuthenticated, user?.id, user?.userType]);

  const loadPaymentHistory = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/payments/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      });
      const json = (await response.json()) as { data?: PaymentHistoryItem[]; error?: string };
      if (!response.ok || !json.data) {
        throw new Error(json.error || 'Não foi possível carregar o histórico');
      }
      setPayments(json.data);
    } catch (error) {
      setPayments([]);
      showToast(error instanceof Error ? error.message : 'Erro ao carregar histórico de assinatura', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, user?.id]);

  const handleDownloadReceipt = useCallback(
    (paymentId: string) => {
      if (!user?.id) return;
      const url = `/api/subscription/payments/receipt?userId=${encodeURIComponent(user.id)}&paymentId=${encodeURIComponent(paymentId)}`;
      window.open(url, '_blank');
    },
    [user?.id]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/entrar');
      return;
    }
    if (user?.userType !== 'company') {
      router.replace('/painel-de-controle');
      return;
    }
    loadPaymentHistory().catch(() => {});
  }, [isAuthenticated, loadPaymentHistory, router, user?.userType]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minha Assinatura</h1>
          <p className="text-gray-600 mt-2">Acompanhe seus pagamentos e baixe os comprovantes da assinatura.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de pagamentos</h2>
            <Button onClick={loadPaymentHistory} variant="outline" size="sm" className="px-4">
              Atualizar
            </Button>
          </div>

          {!canAccessPage ? null : isLoading ? (
            <div className="py-12 text-center text-gray-600">Carregando histórico...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-gray-600">Nenhum pagamento de assinatura encontrado.</div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
                      <div>
                        <p className="text-xs text-gray-500">Plano</p>
                        <p className="text-sm font-semibold text-gray-900">{planLabel[payment.planEmpresa]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Forma de pagamento</p>
                        <p className="text-sm font-semibold text-gray-900">{methodLabel[payment.paymentMethod]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valor</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amountCents)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[payment.status]}`}
                        >
                          {statusLabel[payment.status]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Criado em</p>
                        <p className="text-sm text-gray-800">{formatDate(payment.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pago em</p>
                        <p className="text-sm text-gray-800">{formatDate(payment.paidAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Válido até</p>
                        <p className="text-sm text-gray-800">{formatDate(payment.dueAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Comprovante</p>
                        <Button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          variant="outline"
                          size="sm"
                          className="mt-1 px-3"
                        >
                          Baixar PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinhaAssinaturaPage;
