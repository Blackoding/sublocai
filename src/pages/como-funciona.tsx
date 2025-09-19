import Button from '@/components/Button';
import { useRouter } from 'next/router';
import { SPECIALTIES } from '@/constants/specialties';

const ComoFuncionaPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header da página */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Como Funciona</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma conecta proprietários de consultórios com profissionais da saúde, 
            facilitando a sublocação de espaços médicos de forma segura e eficiente.
          </p>
        </div>

        {/* Seção principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Para Proprietários */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Para Proprietários</h2>
              <p className="text-gray-600 text-lg">
                Coloque seu consultório para sublocação e gere renda extra
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cadastre seu consultório</h3>
                  <p className="text-gray-600">
                    Adicione fotos, descrição, preço e horários de disponibilidade do seu espaço.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Verificação de segurança</h3>
                  <p className="text-gray-600">
                    Nossa equipe verifica todos os consultórios para garantir autenticidade e qualidade.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Receba solicitações</h3>
                  <p className="text-gray-600">
                    Profissionais interessados entram em contato e agendam visitas através da plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => router.push('/anunciar')}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Anunciar meu consultório
              </Button>
            </div>
          </div>

          {/* Para Profissionais */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Para Profissionais</h2>
              <p className="text-gray-600 text-lg">
                Encontre o consultório ideal para sua prática profissional
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Busque por localização</h3>
                  <p className="text-gray-600">
                    Use nossos filtros para encontrar consultórios próximos ao seu local de preferência.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Visualize detalhes</h3>
                  <p className="text-gray-600">
                    Veja fotos, comodidades, preços e horários de disponibilidade de cada consultório.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Agende diretamente</h3>
                  <p className="text-gray-600">
                    Entre em contato com o proprietário e agende sua visita através da nossa plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => router.push('/sublocar')}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Buscar consultórios
              </Button>
            </div>
          </div>
        </div>

        {/* Seção de benefícios */}
        <div className="bg-white rounded-3xl shadow-lg p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher nossa plataforma?</h2>
            <p className="text-xl text-gray-600">
              Facilitamos a sublocação de consultórios para diversas áreas da saúde
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {SPECIALTIES.map((specialty, index) => {
              const colors = [
                { bg: 'bg-blue-100', text: 'text-blue-600' },
                { bg: 'bg-green-100', text: 'text-green-600' },
                { bg: 'bg-purple-100', text: 'text-purple-600' },
                { bg: 'bg-orange-100', text: 'text-orange-600' },
                { bg: 'bg-red-100', text: 'text-red-600' }
              ];
              const icons = [
                <path key="psychology" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
                <path key="nutrition" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                <path key="physiotherapy" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
                <path key="dentistry" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                <path key="law" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              ];
              const descriptions = [
                "Ambientes acolhedores para consultas e terapias psicológicas",
                "Consultórios para nutricionistas e consultas dietéticas",
                "Salas amplas para reabilitação e tratamentos fisioterapêuticos",
                "Espaços equipados para odontologia e cirurgias dentárias",
                "Escritórios profissionais para advogados e consultas jurídicas"
              ];
              
              return (
                <div key={specialty.value} className="text-center">
                  <div className={`${colors[index].bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <svg className={`w-8 h-8 ${colors[index].text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icons[index]}
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{specialty.label}</h3>
                  <p className="text-gray-600 text-sm">
                    {descriptions[index]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção de segurança */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Segurança e Confiabilidade</h2>
            <p className="text-xl text-blue-100">
              Todos os consultórios passam por rigorosa verificação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Verificação de Autenticidade</h3>
              <p className="text-blue-100 text-sm">
                Todos os consultórios são verificados para garantir que não são fake
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Dados Seguros</h3>
              <p className="text-blue-100 text-sm">
                Suas informações pessoais e de pagamento são protegidas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para começar?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se à nossa comunidade de profissionais da saúde
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/sublocar')}
              variant="primary"
              size="lg"
            >
              Buscar consultórios
            </Button>
            <Button
              onClick={() => router.push('/anunciar')}
              variant="outline"
              size="lg"
            >
              Anunciar consultório
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComoFuncionaPage;
