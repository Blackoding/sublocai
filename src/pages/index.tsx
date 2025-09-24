import Hero from "@/components/Hero";
import AdSense from "@/components/AdSense";
import MightLike from "@/components/MightLike";
import Link from "next/link";
import Button from "@/components/Button";
import { GetServerSideProps } from 'next';
// import { getSupabaseClient } from '@/services/supabase';
// import { useSpecialties } from '@/hooks/useSpecialties';
import { Clinic } from '@/types';

// Usar a interface Clinic centralizada dos tipos

interface HomeProps {
  featuredClinics: Clinic[];
}

export default function Home({ featuredClinics }: HomeProps) {
  // Hook para especialidades
  // const { getSpecialtyLabel: _getSpecialtyLabel } = useSpecialties();
  
  return (
    <>
      <Hero />
      <AdSense />
      {/* Seção: Você pode gostar */}
      <section className="py-16 bg-white">
        <MightLike featuredClinics={featuredClinics} />
      </section>
      
      {/* Seção: Como Funciona */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conectamos profissionais da saúde com consultórios disponíveis de forma rápida e segura
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Busque</h3>
              <p className="text-gray-600">
                Encontre consultórios disponíveis na sua região com os filtros que você precisa
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Entre em Contato</h3>
              <p className="text-gray-600">
                Converse diretamente com o proprietário via WhatsApp para negociar horários e valores
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Subloque</h3>
              <p className="text-gray-600">
                Feche o acordo e comece a atender seus pacientes em um ambiente profissional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Para Proprietários e Profissionais */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Para Todos os Perfis</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma atende tanto proprietários quanto profissionais da saúde
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Para Proprietários */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Para Proprietários</h3>
                <p className="text-gray-600">Coloque seu consultório para sublocação e gere renda extra</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Cadastre seu consultório</h4>
                    <p className="text-gray-600 text-sm">Adicione fotos, descrição, preço e horários de disponibilidade</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Verificação de segurança</h4>
                    <p className="text-gray-600 text-sm">Nossa equipe verifica todos os consultórios para garantir qualidade</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Receba solicitações</h4>
                    <p className="text-gray-600 text-sm">Profissionais interessados entram em contato através da plataforma</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/anunciar">
                  <Button variant="primary" size="md" className="w-full">
                    Anunciar meu consultório
                  </Button>
                </Link>
              </div>
            </div>

            {/* Para Profissionais */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Para Profissionais</h3>
                <p className="text-gray-600">Encontre o consultório ideal para sua prática profissional</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Busque por localização</h4>
                    <p className="text-gray-600 text-sm">Use filtros para encontrar consultórios próximos ao seu local</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Visualize detalhes</h4>
                    <p className="text-gray-600 text-sm">Veja fotos, comodidades, preços e horários de disponibilidade</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Agende diretamente</h4>
                    <p className="text-gray-600 text-sm">Entre em contato com o proprietário e agende sua visita</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/sublocar">
                  <Button variant="primary" size="md" className="w-full">
                    Buscar consultórios
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Vantagens */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher nossa plataforma?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Oferecemos a melhor experiência para profissionais e proprietários de consultórios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 rounded-3xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.21a2 2 0 010 2.828l-6.75 6.75a2 2 0 01-2.828 0l-4.5-4.5a2 2 0 010-2.828l6.75-6.75a2 2 0 012.828 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Segurança</h3>
              <p className="text-gray-600 text-sm">
                Todos os consultórios são verificados e os dados protegidos conforme LGPD
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapidez</h3>
              <p className="text-gray-600 text-sm">
                Encontre e contate proprietários em minutos, sem burocracias desnecessárias
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comunidade</h3>
              <p className="text-gray-600 text-sm">
                Faça parte de uma rede de profissionais da saúde em crescimento
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 0A9 9 0 0112 15c-1.657 0-3-1.343-3-3s1.343-3 3-3c.83 0 1.59.342 2.121.879m4.586-4.586a2 2 0 010 2.828L19.293 7.5M10.707 13.293l-4.586 4.586a2 2 0 01-2.828-2.828l4.586-4.586m0 0A9 9 0 019 9c1.657 0 3 1.343 3 3s-1.343 3-3 3c-.83 0-1.59-.342-2.121-.879" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Suporte</h3>
              <p className="text-gray-600 text-sm">
                Nossa equipe está sempre disponível para ajudar você
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Estatísticas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Números que impressionam</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma cresce a cada dia, conectando mais profissionais e consultórios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">+100</div>
              <div className="text-lg text-gray-600">Consultórios Cadastrados</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">+2.300</div>
              <div className="text-lg text-gray-600">Sublocações Realizadas</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">+5</div>
              <div className="text-lg text-gray-600">Regiões Cobertas</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2b9af3] mb-2">98%</div>
              <div className="text-lg text-gray-600">Satisfação dos Usuários</div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#2b9af3] to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para encontrar seu consultório ideal?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de profissionais que já encontraram o espaço perfeito para atender seus pacientes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sublocar" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white text-[#2b9af3] hover:bg-gray-50 border-white"
              >
                Buscar Consultórios
              </Button>
            </Link>
            
            <Link href="/anunciar" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-transparent text-white border-white hover:bg-white hover:text-[#2b9af3]"
              >
                Anunciar Consultório
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Buscar até 4 consultórios ativos para exibir na home usando fetch direto
    const clinicsResponse = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?status=eq.active&select=*&order=created_at.desc&limit=4', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
        'Content-Type': 'application/json'
      }
    });

    if (!clinicsResponse.ok) {
      console.error('Error fetching featured clinics:', clinicsResponse.status, clinicsResponse.statusText);
      return {
        props: {
          featuredClinics: []
        }
      };
    }

    const clinics = await clinicsResponse.json();

    return {
      props: {
        featuredClinics: clinics || []
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        featuredClinics: []
      }
    };
  }
};