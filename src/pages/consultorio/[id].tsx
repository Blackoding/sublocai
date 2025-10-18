import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { SublocationPlus, Clinic } from '@/types';
import SublocationCard from '@/components/SublocationCard';
import Button from '@/components/Button';
import AppointmentModal from '@/components/AppointmentModal';
// import AuthWarning from '@/components/AuthWarning';
// import GoogleMap from '@/components/GoogleMap';
import CommentsSection from '@/components/CommentsSection';
import { getSupabaseClient } from '@/services/supabase';
import { AppointmentService } from '@/services/appointmentService';
// import { SPECIALTIES } from '@/constants/specialties';
import { getFeatureInfo } from '@/constants/features';
import { formatDetailedAddress, formatAvailability } from '@/constants/address';
import { useSpecialties } from '@/hooks/useSpecialties';
import { useOwner } from '@/hooks/useOwner';
import { BackButton } from '@/components/BackButton';
import { useClinicRating } from '@/hooks/useClinicRating';
import { useAuthStore } from '@/stores/authStore';

// Usar a interface Clinic centralizada dos tipos
type Consultorio = Clinic;

interface ConsultorioPageProps {
  consultorio: Consultorio;
  hasAvailability: boolean;
}

const ConsultorioPage = ({ consultorio, hasAvailability }: ConsultorioPageProps) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState<{ date: string; time: string; status: string }[]>([]);
  
  // Hook para autenticação
  const { isAuthenticated, user } = useAuthStore();
  
  // Hook para calcular rating do consultório
  const { rating } = useClinicRating(consultorio.id);
  
  // Hook para especialidades
  const { getSpecialtyLabel } = useSpecialties();
  
  // Hook para obter informações do proprietário
  const { owner, isLoading: ownerLoading } = useOwner(consultorio.user_id);

  // Função auxiliar para verificar se deve usar WhatsApp
  const shouldUseWhatsApp = () => {
    // Se undefined, null ou não definido, assume false (não usar WhatsApp)
    if (consultorio.hasAppointment === undefined || consultorio.hasAppointment === null) {
      return false; // Não usar WhatsApp se não estiver definido
    }
    return consultorio.hasAppointment === false || String(consultorio.hasAppointment) === 'false';
  };

  // Função para gerar link do WhatsApp
  const generateWhatsAppLink = () => {
    if (!owner?.phone) return '#';
    
    // Limpar o telefone (remover caracteres especiais)
    const cleanPhone = owner.phone.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    const phoneWithCountryCode = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    // Mensagem padrão
    const message = `Olá! Gostaria de solicitar um agendamento para o consultório "${consultorio.title}". Poderia me informar sobre a disponibilidade?`;
    
    return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
  };

  // Função para buscar agendamentos existentes
  const loadExistingAppointments = async () => {
    if (!consultorio.id) return;
    
    try {
      const { AppointmentService } = await import('@/services/appointmentService');
      const result = await AppointmentService.getAppointmentsByClinic(consultorio.id);
      
      if (result.data) {
        const appointments = result.data.map(apt => ({
          date: apt.date,
          time: apt.time,
          status: apt.status
        }));
        setExistingAppointments(appointments);
        console.log('Agendamentos existentes carregados:', appointments);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos existentes:', error);
    }
  };

  // Função para abrir o modal de agendamento
  const handleOpenAppointmentModal = () => {
    setIsAppointmentModalOpen(true);
    loadExistingAppointments();
  };

  // Função para lidar com o agendamento
  const handleAppointmentSubmit = async (appointmentData: { date: string; selectedTimes: string[]; notes?: string }) => {
    try {
      // Verificar se o usuário está logado
      if (!isAuthenticated) {
        alert('Você precisa estar logado para fazer um agendamento.');
        return;
      }

      if (!user) {
        alert('Erro: Dados do usuário não encontrados. Faça login novamente.');
        return;
      }

      // Processar múltiplos horários selecionados
      const selectedTimes = appointmentData.selectedTimes || [];
      
      if (selectedTimes.length === 0) {
        alert('Por favor, selecione pelo menos um horário.');
        return;
      }

      // Criar múltiplos agendamentos usando o novo serviço
      const appointmentDataToSend = {
        clinic_id: consultorio.id || '',
        user_id: user.id || '',
        date: appointmentData.date || '',
        selected_times: selectedTimes,
        notes: appointmentData.notes || '',
        value: consultorio.price
      };

      const result = await AppointmentService.createAppointments(appointmentDataToSend);
      
      if (result.error) {
        console.error('Erro ao criar agendamentos:', result.error);
        alert(`Erro ao criar agendamentos: ${result.error}`);
        return;
      }

      // Sucesso
      const timesText = selectedTimes.join(', ');
      const totalValue = consultorio.price * selectedTimes.length;
      alert(`✅ Agendamento criado com sucesso!\n\nData: ${appointmentData.date}\nHorários: ${timesText}\nValor total: R$ ${totalValue.toFixed(2).replace('.', ',')}\n\nVocê receberá uma confirmação por email.`);
      
      // Fechar o modal
      setIsAppointmentModalOpen(false);
      
      console.log('Agendamentos criados com sucesso:', result.data);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    }
  };




  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === consultorio.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? consultorio.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const renderStar = () => {
    return (
      <span className="text-lg text-yellow-400">
        ★
      </span>
    );
  };

  const getSimilarConsultorios = (): Clinic[] => {
    // Por enquanto, retorna array vazio
    // Em uma implementação futura, isso seria buscado do banco de dados
    // baseado em critérios como mesma região, preço similar, etc.
    return [];
  };



  if (!consultorio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Consultório não encontrado</h1>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verificar se os dados essenciais estão presentes
  if (!consultorio.title || !consultorio.price || !consultorio.cep) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dados do consultório incompletos</h1>
          <p className="text-gray-600 mb-4">Alguns dados essenciais estão ausentes.</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{consultorio.title} - Sublease</title>
        <meta name="description" content={`Consultório ${consultorio.title} localizado em ${formatDetailedAddress(consultorio)}. R$ ${consultorio.price.toFixed(2).replace('.', ',')}/hora.`} />
        <meta name="keywords" content={`consultório, sublocação, ${consultorio.specialties.map(s => getSpecialtyLabel(s)).join(', ')}, ${consultorio.city}`} />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header com botão voltar */}
        <div className="bg-white shadow-sm border-b mt-16">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <BackButton />
          </div>
        </div>

        {consultorio?.status === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Consultório em análise:</strong> Este consultório está aguardando verificação e aprovação. A sublocação não está disponível no momento.
                </p>
              </div>
            </div>
          </div>
        )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Informações principais */}
        <div className="bg-white rounded-3xl shadow-md overflow-hidden mb-8">
          {/* Slider de imagens */}
          <div className="relative h-96 bg-gray-200 overflow-hidden">
            {/* Imagem atual */}
            {consultorio.images && consultorio.images.length > 0 && consultorio.images[currentImageIndex] ? (
              <Image 
                src={consultorio.images[currentImageIndex]} 
                alt={`${consultorio.title} - Foto ${currentImageIndex + 1}`}
                width={800}
                height={384}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/office-empty.jpg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Nenhuma foto disponível</p>
                  <p className="text-sm">Este consultório ainda não possui fotos cadastradas</p>
                </div>
              </div>
            )}

            {/* Stamp */}
            {consultorio.stamp && (
              <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-medium z-10 ${
                consultorio.stamp === 'new' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {consultorio.stamp === 'new' ? 'Novo!' : 'Em Alta!'}
              </div>
            )}

            {/* Botões de navegação */}
            {consultorio.images.length > 1 && (
              <>
                {/* Botão anterior */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 z-10 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Botão próximo */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 z-10 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {consultorio.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                {/* Contador de imagens */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                  {currentImageIndex + 1} / {consultorio.images.length}
                </div>
              </>
            )}
          </div>

          <div className="p-8">
            {/* Título e preço */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1 pr-4">{consultorio.title}</h1>
              <span className="text-3xl font-bold text-[#2b9af3]">R$ {consultorio.price.toFixed(2).replace('.', ',')}/hora</span>
            </div>

            {/* Endereço */}
            <p className="text-gray-600 text-lg mb-4">{formatDetailedAddress(consultorio)}</p>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center">
                  {renderStar()}
                </div>
                <span className="text-lg text-gray-600 font-medium">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Features */}
            <div className="flex gap-3 flex-wrap mb-8">
              {consultorio.features.map((feature) => {
                const featureInfo = getFeatureInfo(feature as SublocationPlus);
                return (
                  <div key={feature} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <span className="text-lg">{featureInfo.icon}</span>
                    <span>{featureInfo.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Especialidades */}
            {consultorio.specialties && consultorio.specialties.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Especialidades autorizadas</h2>
                <div className="flex gap-2 flex-wrap">
                  {consultorio.specialties.map((specialty) => (
                    <span key={specialty} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {getSpecialtyLabel(specialty)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">{consultorio.description}</p>
            </div>

            {/* Disponibilidade */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Disponibilidade</h2>
              {hasAvailability ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-3">
                    {formatAvailability(consultorio.availability || [])?.split('\n').map((schedule, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <p className="text-gray-700 font-medium">{schedule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-yellow-800 font-medium">Disponibilidade não configurada</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Este consultório ainda não possui horários de disponibilidade definidos. 
                        Entre em contato com o proprietário para mais informações.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Localização */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Localização</h2>
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {/* Mapa interativo do Google Maps */}
                {/* <GoogleMap 
                  address={consultorio.address}
                  height="h-64"
                  className="rounded-lg"
                /> */}
              </div>
              
              {/* Endereço completo */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço completo</h3>
                <p className="text-gray-600 leading-relaxed">{formatDetailedAddress(consultorio)}</p>
              </div>
            </div>


            {/* Botões de agendamento - só aparece se o consultório estiver ativo */}
            {consultorio.status === 'active' && (
              <div className="flex gap-4">
                {/* Botão de agendamento na plataforma - aparece se hasAppointment for true */}
                {!shouldUseWhatsApp() && hasAvailability && (
                  <Button 
                    size="lg"
                    className="flex-1"
                    onClick={handleOpenAppointmentModal}
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Agendar
                  </Button>
                )}
                
                {/* Botão do WhatsApp - aparece se hasAppointment for false */}
                {shouldUseWhatsApp() && (
                  <>
                    {ownerLoading ? (
                      <Button 
                        size="lg"
                        className="flex-1 bg-green-600 text-white"
                        disabled
                      >
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando...
                      </Button>
                    ) : owner ? (
                      <Button 
                        size="lg"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.open(generateWhatsAppLink(), '_blank')}
                      >
                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Enviar solicitação via WhatsApp
                      </Button>
                    ) : (
                      <div className="flex-1 bg-gray-100 p-6 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-gray-700 font-medium">Informações de contato não disponíveis</p>
                            <p className="text-gray-600 text-sm mt-1">
                              Não foi possível carregar as informações de contato do proprietário.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Mensagem quando não há disponibilidade para agendamento */}
            {consultorio.status === 'active' && !hasAvailability && !shouldUseWhatsApp() && (
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-700 font-medium">Agendamento temporariamente indisponível</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Este consultório não possui horários de disponibilidade configurados. 
                      Entre em contato com o proprietário para mais informações.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Consultórios parecidos */}
        {getSimilarConsultorios().length > 0 && (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Consultórios parecidos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getSimilarConsultorios().map((similarConsultorio) => (
                <SublocationCard
                  key={similarConsultorio.id}
                  id={similarConsultorio.id || ''}
                  title={similarConsultorio.title}
                  address={formatDetailedAddress(similarConsultorio)}
                  price={similarConsultorio.price.toString()}
                  stamp={similarConsultorio.stamp}
                  plus={similarConsultorio.plus}
                  rating={0} // Por enquanto 0, pois getSimilarConsultorios retorna array vazio
                />
              ))}
            </div>
          </div>
        )}

        {/* Seção de Comentários */}
        <div className="mb-8">
          <CommentsSection 
            clinicId={consultorio.id || ''}
            clinicTitle={consultorio.title}
          />
        </div>

      </div>
    </div>

    {/* Modal de Agendamento */}
    <AppointmentModal
      isOpen={isAppointmentModalOpen}
      onClose={() => setIsAppointmentModalOpen(false)}
      onSubmit={handleAppointmentSubmit}
      clinicTitle={consultorio.title}
      clinicPrice={consultorio.price}
      clinicAvailability={consultorio.availability}
      existingAppointments={existingAppointments}
    />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  if (!id) {
    return {
      notFound: true,
    };
  }

  try {
    const supabase = getSupabaseClient();
    
    // Buscar consultório pelo ID
    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !clinic) {
      return {
        notFound: true,
      };
    }


    // Verificar se há disponibilidade configurada
    const hasAvailability = clinic.availability && 
      Array.isArray(clinic.availability) && 
      clinic.availability.length > 0 &&
      clinic.availability.some((item: { day: string; startTime: string; endTime: string }) => 
        item && 
        item.day && 
        item.startTime && 
        item.endTime
      );

    // Verificar se o usuário está logado
    let currentUserId: string | null = null;
    try {
      // Tentar obter o usuário atual através do cookie de sessão
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao obter usuário')), 3000)
      );
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as { data: { user: { id: string } | null } };
      currentUserId = user?.id || null;
    } catch {
      // Se não conseguir obter o usuário, currentUserId permanece null
      // console.log('Usuário não logado ou erro de autenticação:', authError);
    }

    // Incrementar visualizações apenas se:
    // 1. O usuário não estiver logado, OU
    // 2. O usuário estiver logado mas for diferente do proprietário do consultório
    const shouldIncrementViews = !currentUserId || currentUserId !== clinic.user_id;
    
    if (shouldIncrementViews) {
      // console.log(`Incrementando visualizações para consultório ${id}. Usuário atual: ${currentUserId}, Proprietário: ${clinic.user_id}`);
      await supabase
        .from('clinics')
        .update({ views: (clinic.views || 0) + 1 })
        .eq('id', id);
    } else {
      // console.log(`Não incrementando visualizações para consultório ${id}. Usuário atual é o proprietário.`);
    }

    // Formatar dados para a interface
    const consultorio: Consultorio = {
      ...clinic,
      // Adicionar campos de compatibilidade
      plus: clinic.features as SublocationPlus[],
      availability: clinic.availability || [],
      // Garantir que todos os campos sejam serializáveis
      specialties: clinic.specialties || [],
      features: clinic.features || [],
      images: clinic.images || [],
      // Mapear explicitamente o campo hasAppointment (vem como hasappointment do banco)
      hasAppointment: clinic.hasappointment !== undefined ? clinic.hasappointment : true
    };


    return {
      props: {
        consultorio,
        hasAvailability,
      },
    };
  } catch {
    // console.error('Erro no getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
};

export default ConsultorioPage;
