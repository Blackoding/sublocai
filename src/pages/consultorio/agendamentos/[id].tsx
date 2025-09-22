import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AppointmentFilters } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useAppointments } from '@/hooks/useAppointments';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Loading from '@/components/Loading';
import { BackButton } from '@/components/BackButton';

const AppointmentsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading, isAuthenticated } = useAuthStore();
  
  // Filtros
  const [filters, setFilters] = useState<AppointmentFilters>({
    date_from: '',
    date_to: '',
    period: 'all',
    day_of_week: 'all',
    status: 'all'
  });

  // Hook para gerenciar agendamentos
  const { 
    appointments, 
    loading, 
    error, 
    stats, 
    loadAppointments, 
    updateAppointmentStatus 
  } = useAppointments(id as string, filters);

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
      status: 'all'
    });
  };

  // Verificar autenticação
  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      router.push('/entrar');
    }
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getDayOfWeek = (date: string) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date(date).getDay()];
  };

  return (
    <>
      <Head>
        <title>Agendamentos - Sublease</title>
        <meta name="description" content="Gerencie os agendamentos do seu consultório" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header da página */}
            <div className="mb-8">
              <BackButton />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">
                Agendamentos do Consultório
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie todos os agendamentos do seu consultório
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <Input
                    label="Data Inicial"
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(value) => setFilters({ ...filters, date_from: value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <Input
                    label="Data Final"
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(value) => setFilters({ ...filters, date_to: value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia da Semana
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
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
                    <div key={appointment.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              Usuário {appointment.user_id}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Data:</span> {formatDate(appointment.date)} ({getDayOfWeek(appointment.date)})
                            </div>
                            <div>
                              <span className="font-medium">Horário:</span> {formatTime(appointment.time)}
                            </div>
                            <div>
                              <span className="font-medium">Valor:</span> R$ {appointment.value.toFixed(2)}
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Observações:</span> {appointment.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 lg:mt-0 lg:ml-6">
                          <div className="flex flex-wrap gap-2">
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                >
                                  Confirmar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                            
                            {appointment.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              >
                                Marcar como Concluído
                              </Button>
                            )}
                            
                            {appointment.status === 'completed' && (
                              <span className="text-sm text-gray-500">
                                Agendamento concluído
                              </span>
                            )}
                            
                            {appointment.status === 'cancelled' && (
                              <span className="text-sm text-gray-500">
                                Agendamento cancelado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AppointmentsPage;
