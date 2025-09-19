import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PoliticaPrivacidadePage = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header da página */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
            <p className="text-lg text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Conteúdo da Política */}
          <div className="bg-white rounded-3xl shadow-md p-8 space-y-8">
            
            {/* 1. Introdução */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
              <p className="text-gray-700 leading-relaxed">
                A Sublease está comprometida com a proteção da privacidade e dos dados pessoais de nossos usuários. 
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações 
                pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Ao utilizar nossa plataforma, você concorda com as práticas descritas nesta política.
              </p>
            </section>

            {/* 2. Dados Coletados */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Dados Pessoais Coletados</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Coletamos diferentes tipos de dados pessoais para fornecer nossos serviços:
                </p>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">2.1. Dados de Identificação</h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-2">
                    <li>Nome completo</li>
                    <li>CPF (Cadastro de Pessoa Física)</li>
                    <li>Data de nascimento</li>
                    <li>E-mail</li>
                    <li>Telefone</li>
                    <li>Endereço residencial</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">2.2. Dados Profissionais</h3>
                  <ul className="list-disc list-inside text-green-800 space-y-2">
                    <li>Especialidade médica</li>
                    <li>Número do CRM (Conselho Regional de Medicina)</li>
                    <li>Experiência profissional</li>
                    <li>Área de atuação</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">2.3. Dados de Navegação</h3>
                  <ul className="list-disc list-inside text-yellow-800 space-y-2">
                    <li>Endereço IP</li>
                    <li>Informações do navegador</li>
                    <li>Páginas visitadas</li>
                    <li>Tempo de permanência</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">2.4. Dados de Consultórios</h3>
                  <ul className="list-disc list-inside text-purple-800 space-y-2">
                    <li>Endereço do consultório</li>
                    <li>Fotos do espaço</li>
                    <li>Descrição das instalações</li>
                    <li>Preços e disponibilidade</li>
                    <li>Comodidades oferecidas</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Finalidades do Tratamento */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Finalidades do Tratamento</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos seus dados pessoais para as seguintes finalidades:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Prestação de Serviços</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Cadastro e autenticação</li>
                      <li>• Intermediação entre usuários</li>
                      <li>• Verificação de identidade</li>
                      <li>• Suporte ao cliente</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Comunicação</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Notificações sobre consultórios</li>
                      <li>• Atualizações da plataforma</li>
                      <li>• Promoções e ofertas</li>
                      <li>• Suporte técnico</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Melhoria dos Serviços</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Análise de uso da plataforma</li>
                      <li>• Desenvolvimento de funcionalidades</li>
                      <li>• Personalização de conteúdo</li>
                      <li>• Pesquisas de satisfação</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Obrigações Legais</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Cumprimento da LGPD</li>
                      <li>• Relatórios regulatórios</li>
                      <li>• Prevenção de fraudes</li>
                      <li>• Segurança da informação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Base Legal */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Base Legal para o Tratamento</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  O tratamento de seus dados pessoais é realizado com base nas seguintes hipóteses legais:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Consentimento</h3>
                      <p className="text-gray-700 text-sm">Para envio de comunicações promocionais e marketing direto.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Execução de Contrato</h3>
                      <p className="text-gray-700 text-sm">Para prestação dos serviços da plataforma e cumprimento dos termos de uso.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Interesse Legítimo</h3>
                      <p className="text-gray-700 text-sm">Para melhoria dos serviços, análise de dados e prevenção de fraudes.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Cumprimento de Obrigação Legal</h3>
                      <p className="text-gray-700 text-sm">Para atender exigências legais e regulatórias aplicáveis.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Compartilhamento de Dados */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Compartilhamento de Dados</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Seus dados pessoais podem ser compartilhados nas seguintes situações:
                </p>
                
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">5.1. Entre Usuários da Plataforma</h3>
                  <ul className="list-disc list-inside text-red-800 space-y-2">
                    <li>Informações de contato para comunicação sobre consultórios</li>
                    <li>Dados básicos de identificação para verificação</li>
                    <li>Informações profissionais relevantes para a sublocação</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">5.2. Prestadores de Serviços</h3>
                  <ul className="list-disc list-inside text-orange-800 space-y-2">
                    <li>Provedores de hospedagem e infraestrutura</li>
                    <li>Serviços de análise e monitoramento</li>
                    <li>Ferramentas de comunicação e suporte</li>
                    <li>Processadores de pagamento (quando aplicável)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5.3. Autoridades Competentes</h3>
                  <ul className="list-disc list-inside text-gray-800 space-y-2">
                    <li>Quando exigido por lei ou ordem judicial</li>
                    <li>Para investigação de atividades ilegais</li>
                    <li>Para proteção de direitos e segurança</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Seus Direitos */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Seus Direitos</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Conforme a LGPD, você possui os seguintes direitos sobre seus dados pessoais:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Confirmação e Acesso</h3>
                    <p className="text-blue-800 text-sm">Confirmar se tratamos seus dados e acessar as informações.</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Correção</h3>
                    <p className="text-green-800 text-sm">Corrigir dados incompletos, inexatos ou desatualizados.</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">Anonimização</h3>
                    <p className="text-yellow-800 text-sm">Solicitar anonimização, bloqueio ou eliminação de dados.</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Portabilidade</h3>
                    <p className="text-purple-800 text-sm">Solicitar portabilidade dos dados para outro fornecedor.</p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">Eliminação</h3>
                    <p className="text-red-800 text-sm">Eliminar dados tratados com base no consentimento.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Informações</h3>
                    <p className="text-gray-800 text-sm">Obter informações sobre compartilhamento de dados.</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Como Exercer Seus Direitos</h3>
                  <p className="text-blue-800 mb-4">
                    Para exercer qualquer um dos direitos acima, entre em contato conosco:
                  </p>
                  <div className="space-y-2">
                    <p className="text-blue-800">
                      <strong>E-mail:</strong> 
                      <a href="mailto:edsonpinheiroliveira@gmail.com" className="text-blue-600 hover:underline ml-2">
                        edsonpinheiroliveira@gmail.com
                      </a>
                    </p>
                    <p className="text-blue-800">
                      <strong>WhatsApp:</strong> 
                      <a href="https://wa.me/5561982030380" className="text-blue-600 hover:underline ml-2">
                        (61) 98203-0380
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Segurança dos Dados */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Segurança dos Dados</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Implementamos medidas técnicas e organizacionais para proteger seus dados pessoais:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Medidas Técnicas</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Criptografia de dados em trânsito e em repouso
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Controle de acesso baseado em funções
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Monitoramento de segurança 24/7
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Backup regular e seguro dos dados
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Medidas Organizacionais</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Treinamento de equipe em proteção de dados
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Políticas internas de segurança
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Contratos de confidencialidade
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Auditorias regulares de segurança
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Retenção de Dados */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retenção de Dados</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política:
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex justify-between items-center">
                      <span><strong>Dados da conta:</strong> Enquanto sua conta estiver ativa</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Ativo</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span><strong>Dados de navegação:</strong> Até 2 anos</span>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">2 anos</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span><strong>Dados de comunicação:</strong> Até 3 anos</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">3 anos</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span><strong>Dados para obrigações legais:</strong> Conforme exigido por lei</span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Legal</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 9. Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies e Tecnologias Similares</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Cookies Essenciais</h3>
                    <p className="text-green-800 text-sm">Necessários para o funcionamento básico da plataforma.</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">Cookies de Performance</h3>
                    <p className="text-yellow-800 text-sm">Coletam informações sobre como você usa a plataforma.</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Cookies de Funcionalidade</h3>
                    <p className="text-blue-800 text-sm">Lembram suas preferências e configurações.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Alterações na Política */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Alterações nesta Política</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Quando houver alterações significativas, 
                notificaremos você através de e-mail ou por meio de aviso na plataforma.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Recomendamos que você revise esta política regularmente para se manter informado sobre como protegemos seus dados.
              </p>
            </section>

            {/* 11. Contato */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contato</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais:
                </p>
                <div className="space-y-3">
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
                  <p className="text-gray-700">
                    <strong>Horário de Atendimento:</strong> Segunda a Sexta, 8h às 18h
                  </p>
                </div>
              </div>
            </section>

            {/* Rodapé da Política */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                e demais normas aplicáveis de proteção de dados pessoais no Brasil.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PoliticaPrivacidadePage;
