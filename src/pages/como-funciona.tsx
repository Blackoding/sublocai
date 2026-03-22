import type { ReactNode } from "react";
import Button from "@/components/Button";
import { useRouter } from "next/router";

const SPACE_QUICK_TAGS = [
  "Sala",
  "Espaço",
  "Salão",
  "Estúdio",
  "Coworking",
  "+ seu ramo",
] as const;

const SPACE_TYPE_HIGHLIGHTS: ReadonlyArray<{
  label: string;
  description: string;
  bg: string;
  text: string;
  icon: ReactNode;
}> = [
  {
    label: "Espaço",
    description: "Ambientes para atendimento clínico, estético ou consultivo.",
    bg: "bg-blue-100",
    text: "text-blue-600",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
  {
    label: "Sala comercial",
    description:
      "Escritórios, reuniões e atendimentos com infraestrutura pronta.",
    bg: "bg-green-100",
    text: "text-green-600",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
  },
  {
    label: "Espaço multifuncional",
    description:
      "Studios, boxes e áreas flexíveis para diferentes usos no mesmo dia.",
    bg: "bg-purple-100",
    text: "text-purple-600",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
      />
    ),
  },
  {
    label: "Salão e ambientes amplos",
    description:
      "Eventos, turmas, produção e experiências que precisam de metragem.",
    bg: "bg-orange-100",
    text: "text-orange-600",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 5a3 3 0 105.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a3 3 0 105.356 1.857M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
];

const BRANCH_EXAMPLE_TAGS = [
  "Saúde",
  "Beleza",
  "Educação",
  "Eventos",
  "Fitness",
  "Gastronomia",
  "Serviços",
  "Tecnologia",
] as const;

const ComoFuncionaPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header da página */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Como Funciona
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conectamos quem tem um espaço físico com quem precisa sublocar — em
            qualquer ramo. Um fluxo simples para anunciar ou encontrar salas,
            espaços, salões e muito mais.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-3xl mx-auto">
            {SPACE_QUICK_TAGS.map((tag) => {
              const isAccent = tag === "+ seu ramo";
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm ${
                    isAccent
                      ? "border-[#2b9af3]/40 bg-[#2b9af3]/10 text-[#1e7fd4]"
                      : "border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Em 3 passos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Do anúncio ao contato: você encontra ou oferta espaços em poucos
              minutos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Busque
              </h3>
              <p className="text-gray-600">
                Encontre espaços na sua região com filtros que combinam com o
                seu uso
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Entre em contato
              </h3>
              <p className="text-gray-600">
                Converse diretamente com o proprietário via WhatsApp para
                negociar horários e valores
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Subloque
              </h3>
              <p className="text-gray-600">
                Feche o acordo e use o espaço no seu ritmo, com transparência
                entre as partes
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Para todos os perfis
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quem anuncia espaço e quem busca tempo ou turno na mesma plataforma
          </p>
        </div>

        {/* Seção principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Para Proprietários */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Para Proprietários
              </h2>
              <p className="text-gray-600 text-lg">
                Coloque seu espaço para sublocação e gere renda extra, seja qual
                for o segmento
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Cadastre seu espaço
                  </h3>
                  <p className="text-gray-600">
                    Adicione fotos, descrição, preço e horários de
                    disponibilidade do seu imóvel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Verificação de segurança
                  </h3>
                  <p className="text-gray-600">
                    Nossa equipe verifica os anúncios para apoiar autenticidade
                    e qualidade.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Receba solicitações
                  </h3>
                  <p className="text-gray-600">
                    Interessados entram em contato e agendam visitas através da
                    plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => router.push("/anunciar")}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Anunciar meu espaço
              </Button>
            </div>
          </div>

          {/* Para Profissionais */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Para Profissionais
              </h2>
              <p className="text-gray-600 text-lg">
                Encontre o espaço ideal para o seu projeto, agenda ou operação
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Busque por localização
                  </h3>
                  <p className="text-gray-600">
                    Use nossos filtros para encontrar espaços próximos ao seu
                    local de preferência.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Visualize detalhes
                  </h3>
                  <p className="text-gray-600">
                    Veja fotos, comodidades, preços e horários de
                    disponibilidade de cada anúncio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Agende diretamente
                  </h3>
                  <p className="text-gray-600">
                    Entre em contato com o proprietário e agende sua visita
                    através da nossa plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => router.push("/sublocar")}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Buscar espaços
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Qualquer espaço, qualquer ramo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Abaixo são exemplos do que costuma aparecer na plataforma — não é
              lista fechada. Se você pode sublocar um espaço físico, você pode
              anunciar aqui.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SPACE_TYPE_HIGHLIGHTS.map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className={`${item.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <svg
                    className={`w-8 h-8 ${item.text}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.label}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50/60 p-8">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2b9af3]">
                Ramo de atividade
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                Não ficamos presos a um segmento
              </h3>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                Estes rótulos são só referência visual. O SaaS serve para
                qualquer negócio que queira colocar salas, espaços ou salões
                para sublocar.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {BRANCH_EXAMPLE_TAGS.map((branch) => (
                <span
                  key={branch}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
                >
                  {branch}
                </span>
              ))}
              <span className="rounded-full border border-dashed border-[#2b9af3]/50 bg-white px-3 py-1 text-sm font-medium text-[#1e7fd4] shadow-sm">
                + o seu
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos e preços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para começar sua sublocação
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8 shadow-md">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Empresário
                </h3>
                <p className="text-gray-600">
                  Planos para quem anuncia espaços para sublocação
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                  <div className="text-center mb-5">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Gratuito
                    </h4>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        R$0
                      </span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    <p className="text-gray-600 mt-3">
                      Comece a anunciar sem custo e valide sua operação
                    </p>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Até 1 sala</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Até 10 agendamentos/mês</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Suporte por email</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Pagamento online</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push("/cadastrar")}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      Começar grátis
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                  <div className="text-center mb-5">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Básico
                    </h4>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        R$39
                      </span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    <p className="text-gray-600 mt-3">
                      Mais salas, mais agendamentos e controle no dashboard
                    </p>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Tudo do plano gratuito</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Até 6 salas</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Agendamentos ilimitados</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Dashboard</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push("/cadastrar")}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      Assinar Básico
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#2b9af3] flex flex-col">
                  <div className="text-center mb-5">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Avançado
                    </h4>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        R$79
                      </span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    <p className="text-gray-600 mt-3">
                      Mais salas e suporte prioritário por WhatsApp
                    </p>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Tudo do plano Básico</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Até 20 salas</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-gray-700">Suporte por WhatsApp</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push("/cadastrar")}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      Assinar Avançado
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 shadow-md">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Profissional
                </h3>
                <p className="text-gray-600">
                  Plano para quem busca sublocar espaços
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center mb-5">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Gratuito
                  </h4>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      R$0
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <p className="text-gray-600 mt-3">
                    Busque espaços e entre em contato sem custo mensal
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-gray-700">Busca por localização</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-gray-700">
                      Visualização de detalhes do anúncio
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-gray-700">
                      Agende visitas e combine uso do espaço online
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => router.push("/sublocar")}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Buscar espaços
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Números que impressionam
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma cresce a cada dia, conectando mais pessoas e
              espaços
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">+100</div>
              <div className="text-lg text-gray-600">Espaços cadastrados</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">
                +2.300
              </div>
              <div className="text-lg text-gray-600">
                Sublocações realizadas
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">+5</div>
              <div className="text-lg text-gray-600">Regiões cobertas</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">98%</div>
              <div className="text-lg text-gray-600">
                Satisfação dos usuários
              </div>
            </div>
          </div>
        </div>

        {/* Seção de segurança */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Segurança e Confiabilidade
            </h2>
            <p className="text-xl text-blue-100">
              Os anúncios passam por verificação para apoiar confiança na
              comunidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                Verificação de Autenticidade
              </h3>
              <p className="text-blue-100 text-sm">
                Anúncios passam por checagens para reduzir perfis e espaços
                falsos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Dados Seguros</h3>
              <p className="text-blue-100 text-sm">
                Suas informações pessoais e de pagamento são protegidas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Suporte 24/7</h3>
              <p className="text-blue-100 text-sm">
                Nossa equipe está sempre disponível para ajudar
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Faça parte da comunidade que movimenta sublocação em vários
            segmentos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/sublocar")}
              variant="primary"
              size="lg"
            >
              Buscar espaços
            </Button>
            <Button
              onClick={() => router.push("/anunciar")}
              variant="outline"
              size="lg"
            >
              Anunciar espaço
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComoFuncionaPage;
