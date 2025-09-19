import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermosDeUsoPage = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header da página */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Termos de Uso</h1>
            <p className="text-lg text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Conteúdo dos Termos */}
          <div className="bg-white rounded-3xl shadow-md p-8 space-y-8">
            
            {/* 1. Aceitação dos Termos */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e utilizar a plataforma Sublease, você concorda em cumprir e estar vinculado aos presentes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve utilizar nossa plataforma.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Estes termos constituem um acordo legal entre você e a Sublease, e regem o uso da plataforma de sublocação de consultórios médicos.
              </p>
            </section>

            {/* 2. Definições */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definições</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Plataforma:</strong> Refere-se ao site, aplicativo e todos os serviços oferecidos pela Sublease.
                </p>
                <p className="text-gray-700">
                  <strong>Usuário:</strong> Pessoa física ou jurídica que utiliza a plataforma.
                </p>
                <p className="text-gray-700">
                  <strong>Proprietário:</strong> Usuário que oferece consultórios para sublocação.
                </p>
                <p className="text-gray-700">
                  <strong>Profissional:</strong> Usuário que busca consultórios para sublocação.
                </p>
                <p className="text-gray-700">
                  <strong>Sublocação:</strong> Contrato de locação temporária de consultórios médicos.
                </p>
              </div>
            </section>

            {/* 3. Descrição do Serviço */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Descrição do Serviço</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A Sublease é uma plataforma digital que conecta proprietários de consultórios médicos com profissionais da saúde 
                que necessitam de espaços para atendimento. Nossa plataforma facilita:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Cadastro e listagem de consultórios disponíveis</li>
                <li>Busca e filtros para encontrar consultórios adequados</li>
                <li>Intermediação entre proprietários e profissionais</li>
                <li>Verificação de autenticidade dos espaços</li>
                <li>Suporte ao processo de sublocação</li>
              </ul>
            </section>

            {/* 4. Cadastro e Conta do Usuário */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cadastro e Conta do Usuário</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Para utilizar a plataforma, é necessário criar uma conta fornecendo informações verdadeiras, precisas e atualizadas.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Responsabilidades do Usuário:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Manter a confidencialidade de sua senha</li>
                  <li>Notificar imediatamente sobre uso não autorizado de sua conta</li>
                  <li>Atualizar informações pessoais quando necessário</li>
                  <li>Ser maior de 18 anos ou ter representação legal adequada</li>
                </ul>
              </div>
            </section>

            {/* 5. Proteção de Dados Pessoais - LGPD */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Proteção de Dados Pessoais - LGPD</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  A Sublease está comprometida com a proteção dos dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">5.1. Dados Coletados</h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>Dados de identificação (nome, CPF, e-mail, telefone)</li>
                    <li>Dados de endereço e localização</li>
                    <li>Dados profissionais (especialidade, CRM, etc.)</li>
                    <li>Dados de navegação e uso da plataforma</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">5.2. Finalidades do Tratamento</h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1">
                    <li>Prestação dos serviços da plataforma</li>
                    <li>Verificação de identidade e autenticidade</li>
                    <li>Comunicação entre usuários</li>
                    <li>Melhoria dos serviços oferecidos</li>
                    <li>Cumprimento de obrigações legais</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">5.3. Seus Direitos</h3>
                  <ul className="list-disc list-inside text-yellow-800 space-y-1">
                    <li>Confirmação da existência de tratamento</li>
                    <li>Acesso aos dados pessoais</li>
                    <li>Correção de dados incompletos ou inexatos</li>
                    <li>Anonimização, bloqueio ou eliminação</li>
                    <li>Portabilidade dos dados</li>
                    <li>Eliminação dos dados tratados com consentimento</li>
                    <li>Informações sobre compartilhamento</li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  Para exercer seus direitos, entre em contato conosco através do e-mail: 
                  <a href="mailto:edsonpinheiroliveira@gmail.com" className="text-blue-600 hover:underline">
                    edsonpinheiroliveira@gmail.com
                  </a>
                </p>
              </div>
            </section>

            {/* 6. Responsabilidades dos Usuários */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Responsabilidades dos Usuários</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">6.1. Proprietários de Consultórios</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Fornecer informações verdadeiras sobre o consultório</li>
                  <li>Manter o espaço em condições adequadas para uso</li>
                  <li>Cumprir os horários de disponibilidade informados</li>
                  <li>Respeitar a legislação sanitária e profissional</li>
                  <li>Possuir documentação legal para sublocação</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">6.2. Profissionais da Saúde</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Possuir registro profissional válido</li>
                  <li>Utilizar o espaço conforme sua finalidade</li>
                  <li>Respeitar as regras de uso do consultório</li>
                  <li>Manter a confidencialidade dos pacientes</li>
                  <li>Cumprir com os pagamentos acordados</li>
                </ul>
              </div>
            </section>

            {/* 7. Proibições */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Proibições</h2>
              <p className="text-gray-700 leading-relaxed mb-4">É expressamente proibido:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Fornecer informações falsas ou enganosas</li>
                <li>Utilizar a plataforma para atividades ilegais</li>
                <li>Interferir no funcionamento da plataforma</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Realizar spam ou comunicações não solicitadas</li>
                <li>Discriminar outros usuários</li>
                <li>Submeter conteúdo inadequado ou ofensivo</li>
              </ul>
            </section>

            {/* 8. Limitação de Responsabilidade */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  A Sublease atua como intermediária entre proprietários e profissionais. Nossa responsabilidade limita-se a:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Manter a plataforma funcionando adequadamente</li>
                  <li>Verificar a autenticidade das informações básicas</li>
                  <li>Facilitar a comunicação entre as partes</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Não nos responsabilizamos por:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Disputas entre proprietários e profissionais</li>
                  <li>Danos materiais ou morais decorrentes do uso dos consultórios</li>
                  <li>Problemas de infraestrutura ou equipamentos</li>
                  <li>Questões relacionadas à prática profissional</li>
                </ul>
              </div>
            </section>

            {/* 9. Propriedade Intelectual */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Propriedade Intelectual</h2>
              <p className="text-gray-700 leading-relaxed">
                Todo o conteúdo da plataforma, incluindo textos, imagens, logos, design e funcionalidades, 
                são de propriedade da Sublease e protegidos por leis de propriedade intelectual.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Os usuários mantêm os direitos sobre o conteúdo que enviam, mas concedem à Sublease 
                licença para utilizá-lo conforme necessário para o funcionamento da plataforma.
              </p>
            </section>

            {/* 10. Modificações dos Termos */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modificações dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                As alterações entrarão em vigor imediatamente após sua publicação na plataforma.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                O uso continuado da plataforma após as modificações constitui aceitação dos novos termos.
              </p>
            </section>

            {/* 11. Rescisão */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Rescisão</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos suspender ou encerrar sua conta a qualquer momento, com ou sem aviso prévio, 
                em caso de violação destes Termos de Uso.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Você pode encerrar sua conta a qualquer momento através das configurações da plataforma 
                ou entrando em contato conosco.
              </p>
            </section>

            {/* 12. Lei Aplicável */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Lei Aplicável e Foro</h2>
              <p className="text-gray-700 leading-relaxed">
                Estes Termos de Uso são regidos pela legislação brasileira. 
                Qualquer disputa será resolvida no foro da comarca de Brasília/DF.
              </p>
            </section>

            {/* 13. Contato */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contato</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para dúvidas sobre estes Termos de Uso ou sobre a plataforma, entre em contato:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>E-mail:</strong> 
                    <a href="mailto:edsonpinheiroliveira@gmail.com" className="text-blue-600 hover:underline ml-2">
                      edsonpinheiroliveira@gmail.com
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <strong>WhatsApp:</strong> 
                    <a href="https://wa.me/5561982030380" className="text-blue-600 hover:underline ml-2">
                      (61) 98203-0380
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Rodapé dos Termos */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                Estes Termos de Uso foram elaborados em conformidade com a legislação brasileira, 
                incluindo a Lei Geral de Proteção de Dados (LGPD), o Código de Defesa do Consumidor 
                e demais normas aplicáveis.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermosDeUsoPage;
