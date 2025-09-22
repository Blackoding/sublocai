import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AppointmentFilters, Clinic } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useAppointments } from '@/hooks/useAppointments';
import { clinicUtils } from '@/services/clinicService';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Loading from '@/components/Loading';
import AppointmentCard from '@/components/AppointmentCard';
import { BackButton } from '@/components/BackButton';

const AppointmentsPage = () => {
  const router = useRouter();
  const { clinic } = router.query;
  const { user, isLoading, isAuthenticated, getCurrentUser } = useAuthStore();
  
  // Filtros
  const [filters, setFilters] = useState<AppointmentFilters>({
    date_from: '',
    date_to: '',
    period: 'all',
    day_of_week: 'all',
    status: 'all',
    clinic_id: ''
  });

  // Estado para consultórios do usuário
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);

  // Função para carregar consultórios do usuário
  const loadUserClinics = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingClinics(true);
      console.log('AppointmentsPage - Carregando consultórios do usuário:', user.id);
      
      const result = await clinicUtils.getClinicsByUser(user.id);
      
      if (result.success && result.clinics) {
        setClinics(result.clinics);
        console.log('AppointmentsPage - Consultórios carregados:', result.clinics.length);
      } else {
        console.error('AppointmentsPage - Erro ao carregar consultórios:', result.error);
      }
    } catch (error) {
      console.error('AppointmentsPage - Erro inesperado ao carregar consultórios:', error);
    } finally {
      setLoadingClinics(false);
    }
  };

  // Inicializar autenticação
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated && router.isReady) {
      console.log('AppointmentsPage - Chamando getCurrentUser...');
      getCurrentUser();
    }
  }, [isAuthenticated, router.isReady]);

  // Carregar consultórios quando o usuário estiver disponível
  useEffect(() => {
    if (user?.id) {
      loadUserClinics();
    }
  }, [user?.id]);

  // Hook para gerenciar agendamentos - agora sem clinicId fixo
  const { 
    appointments, 
    loading, 
    error, 
    stats, 
    loadAppointments, 
    updateAppointmentStatus 
  } = useAppointments('', filters, user?.id); // clinicId vazio, será determinado pelo filtro, userId para "Todos os Consultórios"

  // Aplicar filtro de consultório quando a URL contém o parâmetro clinic
  // Aguardar os consultórios serem carregados primeiro
  useEffect(() => {
    if (router.isReady && clinic && typeof clinic === 'string' && clinics.length > 0) {
      console.log('AppointmentsPage - Aplicando filtro de consultório da URL:', clinic);
      console.log('AppointmentsPage - Consultórios disponíveis:', clinics.length);
      setFilters(prev => ({
        ...prev,
        clinic_id: clinic
      }));
      
      // Aplicar filtros automaticamente quando vem de ClinicCard
      console.log('AppointmentsPage - Aplicando filtros automaticamente...');
      setTimeout(() => {
        loadAppointments();
      }, 100); // Pequeno delay para garantir que o estado foi atualizado
    }
  }, [router.isReady, clinic, clinics.length]); // Removido loadAppointments das dependências

  // Debug: verificar se o parâmetro clinic está sendo passado corretamente
  useEffect(() => {
    console.log('AppointmentsPage - Router query:', router.query);
    console.log('AppointmentsPage - Clinic parameter:', clinic);
    console.log('AppointmentsPage - Router ready:', router.isReady);
    console.log('AppointmentsPage - Filters:', filters);
    console.log('AppointmentsPage - Clinics loaded:', clinics.length);
    console.log('AppointmentsPage - Loading clinics:', loadingClinics);
  }, [router.query, clinic, router.isReady, filters, clinics.length, loadingClinics]);

  // Aplicar filtros
  const applyFilters = () => {
    loadAppointments();
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      period: 'all',
      day_of_week: 'all',
      status: 'all',
      clinic_id: ''
    });
  };

  // Debug: verificar estado de autenticação
  console.log('AppointmentsPage - Estado de autenticação:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id
  });

  // Verificar autenticação
  if (isLoading) {
    console.log('AppointmentsPage - Mostrando loading...');
    return <Loading />;
  }

  // Verificação de autenticação
  if (!isAuthenticated || !user) {
    console.log('AppointmentsPage - Usuário não autenticado, redirecionando...');
    if (typeof window !== 'undefined') {
      // Só redirecionar no lado do cliente
      router.push('/entrar');
    }
    return null;
  }

  console.log('AppointmentsPage - Usuário autenticado, renderizando página...');

  return (
    <>
      <Head>
        <title>Agendamentos - Sublease</title>
        <meta name="description" content="Gerencie todos os agendamentos dos seus consultórios" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header da página */}
            <div className="mb-8 mt-16">
              <BackButton />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">
                Meus Agendamentos
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie todos os agendamentos dos seus consultórios
              </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmados</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelados</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
              
              {/* Primeira linha: Data Inicial | Data Final | Período */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Input
                    label="Data Inicial"
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(value) => setFilters({ ...filters, date_from: value })}
                  />
                </div>
                
                <div>
                  <Input
                    label="Data Final"
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(value) => setFilters({ ...filters, date_to: value })}
                  />
                </div>
                
                <div>
                  <Select
                    label="Período"
                    value={filters.period || 'all'}
                    onChange={(value) => setFilters({ ...filters, period: value as 'morning' | 'afternoon' | 'evening' | 'all' })}
                    options={[
                      { value: 'all', label: 'Todos' },
                      { value: 'morning', label: 'Manhã (06:00-12:00)' },
                      { value: 'afternoon', label: 'Tarde (12:00-18:00)' },
                      { value: 'evening', label: 'Noite (18:00-23:59)' }
                    ]}
                  />
                </div>
              </div>

              {/* Segunda linha: Dia da Semana | Status | Consultório */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Select
                    label="Dia da Semana"
                    value={filters.day_of_week || 'all'}
                    onChange={(value) => setFilters({ ...filters, day_of_week: value as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'all' })}
                    options={[
                      { value: 'all', label: 'Todos' },
                      { value: 'monday', label: 'Segunda-feira' },
                      { value: 'tuesday', label: 'Terça-feira' },
                      { value: 'wednesday', label: 'Quarta-feira' },
                      { value: 'thursday', label: 'Quinta-feira' },
                      { value: 'friday', label: 'Sexta-feira' },
                      { value: 'saturday', label: 'Sábado' },
                      { value: 'sunday', label: 'Domingo' }
                    ]}
                  />
                </div>
                
                <div>
                  <Select
                    label="Status"
                    value={filters.status || 'all'}
                    onChange={(value) => setFilters({ ...filters, status: value as 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'all' })}
                    options={[
                      { value: 'all', label: 'Todos' },
                      { value: 'pending', label: 'Pendente' },
                      { value: 'confirmed', label: 'Confirmado' },
                      { value: 'cancelled', label: 'Cancelado' },
                      { value: 'completed', label: 'Concluído' }
                    ]}
                  />
                </div>
                
                <div>
                  <Select
                    label="Consultório"
                    value={filters.clinic_id || 'all'}
                    onChange={(value) => {
                      console.log('AppointmentsPage - Select onChange:', value);
                      setFilters({ ...filters, clinic_id: value === 'all' ? '' : value });
                    }}
                    options={[
                      { value: 'all', label: 'Todos os Consultórios' },
                      ...clinics.map(clinic => ({
                        value: clinic.id || '',
                        label: clinic.title || 'Consultório sem nome'
                      }))
                    ]}
                    disabled={loadingClinics}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Lista de agendamentos */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Agendamentos ({appointments.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <Loading />
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={loadAppointments} className="mt-4">
                    Tentar Novamente
                  </Button>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">Nenhum agendamento encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onUpdateStatus={updateAppointmentStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

      </div>
    </>
  );
};

export default AppointmentsPage;
