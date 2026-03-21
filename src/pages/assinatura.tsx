import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/Button';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

type PlanEmpresa = 'basic' | 'pro';
type PaymentMethod = 'pix' | 'card';

const PLAN_DETAILS: Record<
  PlanEmpresa,
  {
    title: string;
    priceLabel: string;
    description: string;
    features: string[];
  }
> = {
  basic: {
    title: 'Básico',
    priceLabel: 'R$39/mês',
    description: 'Mais salas, mais agendamentos e controle no dashboard',
    features: [
      'Até 6 salas',
      'Agendamentos ilimitados',
      'Dashboard'
    ]
  },
  pro: {
    title: 'Avançado',
    priceLabel: 'R$79/mês',
    description: 'Seu atendimento com suporte e pagamento online',
    features: [
      'Tudo do plano Básico',
      'Até 20 salas',
      'Suporte por WhatsApp',
      'Pagamento online'
    ]
  }
};

const normalizePlan = (value: unknown): PlanEmpresa | null => {
  if (value === 'basic' || value === 'pro') return value;
  return null;
};

const SubscriptionPage = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [isSimulatingPix, setIsSimulatingPix] = useState(false);
  const [isLoadingCardCheckout, setIsLoadingCardCheckout] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pixQrCodeId, setPixQrCodeId] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [pixQrSrc, setPixQrSrc] = useState('');
  const [pixExpiresAt, setPixExpiresAt] = useState('');

  const plan = useMemo<PlanEmpresa>(() => {
    const queryPlan = normalizePlan(router.query.plan);
    if (queryPlan) return queryPlan;
    return 'basic';
  }, [router.query.plan]);

  const selectedPlanDetails = useMemo(() => PLAN_DETAILS[plan], [plan]);

  const goToPlan = useCallback((selectedPlan: PlanEmpresa) => {
    router.push(`/assinatura?plan=${selectedPlan}`);
  }, [router]);

  const createAbacatePayment = useCallback(
    async (method: PaymentMethod) => {
      const response = await fetch('/api/payments/abacate/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          method,
          userId: user?.id || undefined
        })
      });

      const json = (await response.json()) as {
        data?:
          | {
              method: 'card';
              checkoutUrl: string;
            }
          | {
              method: 'pix';
              pixQrCodeId: string;
              brCode: string;
              brCodeBase64: string;
              expiresAt?: string;
            };
        error?: string;
      };

      if (!response.ok || !json.data) {
        throw new Error(json.error || 'Falha ao gerar pagamento');
      }

      return json.data;
    },
    [plan, user?.id]
  );

  const handleStartPix = useCallback(async () => {
    if (isLoadingPix) return;
    setActivePaymentMethod('pix');
    setIsLoadingPix(true);

    try {
      const data = await createAbacatePayment('pix');
      if (data.method !== 'pix') {
        throw new Error('Resposta inválida para PIX');
      }
      setPixQrCodeId(data.pixQrCodeId);
      setPixCode(data.brCode);
      setPixQrSrc(data.brCodeBase64);
      setPixExpiresAt(data.expiresAt || '');
    } catch (error) {
      setPixQrCodeId('');
      setPixCode('');
      setPixQrSrc('');
      setPixExpiresAt('');
      showToast(error instanceof Error ? error.message : 'Erro ao gerar PIX', 'error');
    } finally {
      setIsLoadingPix(false);
    }
  }, [createAbacatePayment, isLoadingPix, showToast]);

  const handleSimulatePixPayment = useCallback(async () => {
    if (!user?.id || !pixQrCodeId || isSimulatingPix) return;
    setIsSimulatingPix(true);

    try {
      const response = await fetch('/api/payments/abacate/simulate-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          pixQrCodeId
        })
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || 'Falha ao simular pagamento PIX');
      }

      await fetch('/api/subscription/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      });

      showToast('Pagamento PIX simulado com sucesso.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao simular pagamento PIX', 'error');
    } finally {
      setIsSimulatingPix(false);
    }
  }, [isSimulatingPix, pixQrCodeId, showToast, user?.id]);

  const handleCopyPixCode = useCallback(async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      showToast('Código Pix copiado com sucesso!', 'success');
      return;
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = pixCode;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('Código Pix copiado com sucesso!', 'success');
      } catch {
        showToast('Não foi possível copiar o código Pix.', 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }, [pixCode, showToast]);

  const handleSubmitCard = useCallback(async () => {
    if (isLoadingCardCheckout) return;
    setIsLoadingCardCheckout(true);
    try {
      const data = await createAbacatePayment('card');
      if (data.method !== 'card' || !data.checkoutUrl) {
        throw new Error('Checkout do cartão inválido');
      }
      window.location.href = data.checkoutUrl;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Não foi possível abrir o checkout do cartão.', 'error');
    } finally {
      setIsLoadingCardCheckout(false);
    }
  }, [createAbacatePayment, isLoadingCardCheckout, showToast]);

  const checkPaymentAndRedirect = useCallback(async () => {
    if (!user?.id || user.userType !== 'company' || isRedirecting) return false;

    const response = await fetch('/api/subscription/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.id })
    });

    const json = (await response.json()) as {
      data?: {
        showWarning: boolean;
      };
    };

    if (!response.ok || !json.data) return false;
    if (json.data.showWarning) return false;

    setIsRedirecting(true);
    showToast('Pagamento confirmado. Redirecionando para o dashboard...', 'success');
    router.push('/painel-de-controle');
    return true;
  }, [isRedirecting, router, showToast, user?.id, user?.userType]);

  useEffect(() => {
    if (!user?.id || user.userType !== 'company' || isRedirecting) return;

    const intervalId = window.setInterval(() => {
      checkPaymentAndRedirect().catch(() => {});
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [checkPaymentAndRedirect, isRedirecting, user?.id, user?.userType]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assinatura do Plano</h1>
          <p className="text-gray-600">Escolha seu plano e finalize o pagamento via PIX ou Cartão de crédito</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <button
            type="button"
            onClick={() => goToPlan('basic')}
            className={`p-6 rounded-3xl border text-left transition-colors ${
              plan === 'basic'
                ? 'border-[#2b9af3] bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm text-gray-500">Básico</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">R$39</div>
            <div className="text-xs text-gray-500 mt-1">/mês</div>
          </button>

          <button
            type="button"
            onClick={() => goToPlan('pro')}
            className={`p-6 rounded-3xl border text-left transition-colors ${
              plan === 'pro'
                ? 'border-[#2b9af3] bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm text-gray-500">Profissional</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">R$79</div>
            <div className="text-xs text-gray-500 mt-1">/mês</div>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detalhes do plano {selectedPlanDetails.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedPlanDetails.description}</p>
            </div>
            <div className="text-sm font-semibold text-[#2b9af3]">{selectedPlanDetails.priceLabel}</div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedPlanDetails.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-[#2b9af3] leading-5">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pagamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleStartPix}
              variant="primary"
              size="lg"
              className="w-full bg-black text-white hover:bg-black"
            >
              {isLoadingPix ? 'Gerando PIX...' : 'Pagar via PIX'}
            </Button>

            <Button
              onClick={() => {
                setActivePaymentMethod('card');
              }}
              variant="secondary"
              size="lg"
              className="w-full bg-gray-900 text-white hover:bg-gray-900"
            >
              Pagar via Cartão de crédito
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            Se você já estiver logado, você pode voltar ao painel depois do pagamento.
          </div>

          {activePaymentMethod === 'pix' && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PIX</h3>

              {isLoadingPix ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-700">Gerando PIX...</p>
                </div>
              ) : pixQrSrc ? (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <img src={pixQrSrc} alt="QR Code Pix" className="w-[240px] h-[240px]" />
                  </div>

                  <div className="flex-1 w-full">
                    {pixCode ? (
                      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Copie e cole o código</p>
                            <p className="text-xs text-gray-500 mt-1">O código pode conter caracteres especiais.</p>
                          </div>
                          <Button
                            onClick={handleCopyPixCode}
                            variant="primary"
                            size="md"
                            className="bg-[#2b9af3] hover:bg-[#1e7ce6] text-white border-[#2b9af3] hover:border-[#1e7ce6] shrink-0"
                          >
                            Copiar
                          </Button>
                        </div>

                        <div className="mt-4">
                          <input
                            readOnly
                            value={pixCode}
                            onFocus={(e) => e.currentTarget.select()}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        {pixExpiresAt && (
                          <p className="text-xs text-gray-500 mt-3">
                            Expira em: {new Date(pixExpiresAt).toLocaleString('pt-BR')}
                          </p>
                        )}
                        <div className="mt-4">
                          <Button
                            onClick={handleSimulatePixPayment}
                            disabled={!pixQrCodeId || isSimulatingPix}
                            variant="outline"
                            size="md"
                            className="w-full sm:w-auto px-4 text-gray-700 border-gray-300"
                          >
                            {isSimulatingPix ? 'Simulando...' : 'Simular pagamento PIX (dev)'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-700">Código Pix não configurado no momento.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-700">QR Code Pix não configurado no momento.</p>
                </div>
              )}
            </div>
          )}

          {activePaymentMethod === 'card' && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cartão de crédito</h3>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Ao clicar, você será redirecionado na mesma aba para o checkout seguro da AbacatePay.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <Button
                    onClick={handleSubmitCard}
                    disabled={isLoadingCardCheckout}
                    variant="primary"
                    size="lg"
                    className="bg-black hover:bg-black text-white border-black disabled:bg-gray-300 disabled:text-gray-600 disabled:border-gray-300"
                  >
                    {isLoadingCardCheckout ? 'Gerando checkout...' : 'Pagar com cartão'}
                  </Button>
                  <p className="text-xs text-gray-500">O cartão é processado no checkout da AbacatePay.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push('/painel-de-controle')}
            variant="outline"
            size="md"
            className="w-full sm:w-auto px-8"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

