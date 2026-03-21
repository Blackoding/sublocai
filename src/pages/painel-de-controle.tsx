import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import ClinicCard from '@/components/ClinicCard';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { formatDetailedAddress } from '@/constants/address';
import { Appointment } from '@/types';
import { AppointmentService } from '@/services/appointmentService';

type DashboardClinic = {
  id: string;
  title: string;
  address: string;
  price: string;
  status: 'ativo' | 'pendente' | 'inativo';
  images: string[];
  specialty: string;
  createdAt: string;
  views: number;
  bookings: number;
  rating: number;
};

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getAppointmentStatusText = (status: Appointment['status']) => {
  if (status === 'pending') return 'Pendente';
  if (status === 'confirmed') return 'Confirmado';
  if (status === 'cancelled') return 'Cancelado';
  if (status === 'completed') return 'Concluído';
  return status;
};

const getAppointmentStatusStyle = (status: Appointment['status']) => {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (status === 'confirmed') return 'bg-blue-100 text-blue-700';
  if (status === 'cancelled') return 'bg-red-100 text-red-700';
  if (status === 'completed') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
};

const formatAppointmentDate = (dateValue: string) => {
  if (!dateValue) return '-';
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return '-';
  return parsedDate.toLocaleDateString('pt-BR');
};

const getWeekdayLabel = (dateValue: string) => {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Dia';
  return parsedDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
};

const ControlPanelPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const [clinics, setClinics] = useState<DashboardClinic[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [financialData, setFinancialData] = useState({
    received: 0,
    pending: 0,
    isLoading: false
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clinicId: string | null;
    clinicTitle: string;
  }>({
    isOpen: false,
    clinicId: null,
    clinicTitle: ''
  });

  useEffect(() => {
    const loadClinics = async () => {
      if (!isAuthenticated || !user?.id) return;
      if (user.userType === 'professional') {
        setClinics([]);
        return;
      }

      setIsLoadingClinics(true);
      try {
        const { clinicUtils } = await import('@/services/clinicService');
        const result = await clinicUtils.getClinicsByUser(user.id);

        if (result.success && result.clinics) {
          const formattedClinics: DashboardClinic[] = result.clinics.map(clinic => ({
            id: clinic.id || '',
            title: clinic.title,
            address: formatDetailedAddress(clinic),
            price: clinic.price.toString(),
            status:
              clinic.status === 'active'
                ? 'ativo'
                : clinic.status === 'pending'
                  ? 'pendente'
                  : 'inativo',
            images: clinic.images || ['/office-empty.jpg'],
            specialty: clinic.specialty,
            createdAt: clinic.created_at || '',
            views: clinic.views || 0,
            bookings: clinic.bookings || 0,
            rating: clinic.rating || 0
          }));
          setClinics(formattedClinics);
          return;
        }

        setClinics([]);
      } catch {
        setClinics([]);
      } finally {
        setIsLoadingClinics(false);
      }
    };

    loadClinics();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!isAuthenticated || !user?.id) return;

      setIsLoadingAppointments(true);
      setFinancialData(prev => ({ ...prev, isLoading: true }));

      try {
        const result = await AppointmentService.getAllUserAppointments(user.id);
        const allAppointments = result.data || [];
        setAppointments(allAppointments);

        const completedAppointments = allAppointments.filter(appointment => appointment.status === 'completed');
        const pendingAppointments = allAppointments.filter(
          appointment => appointment.status === 'pending' || appointment.status === 'confirmed'
        );

        const received = completedAppointments.reduce((sum, appointment) => sum + (appointment.value || 0), 0);
        const pending = pendingAppointments.reduce((sum, appointment) => sum + (appointment.value || 0), 0);

        setFinancialData({
          received,
          pending,
          isLoading: false
        });
      } catch {
        setAppointments([]);
        setFinancialData({
          received: 0,
          pending: 0,
          isLoading: false
        });
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [isAuthenticated, user?.id]);

  const isCompany = user?.userType === 'company';
  const isProfessional = user?.userType === 'professional';
  const isCompanyFree = isCompany && (user?.planEmpresa === 'free' || !user?.planEmpresa);
  const isCompanyBasic = isCompany && (user?.planEmpresa === 'basic' || user?.planEmpresa === 'pro');
  const isProfessionalFree = isProfessional;

  const panelType = isCompanyFree
    ? 'company-free'
    : isCompanyBasic
      ? 'company-basic'
      : isProfessionalFree
        ? 'professional-free'
        : 'company-free';
  const isProfessionalPanel = panelType === 'professional-free';
  const isCompanyFreePanel = panelType === 'company-free';
  const isCompanyBasicPanel = panelType === 'company-basic';

  const clinicsForPanel = isCompanyFreePanel ? clinics.slice(0, 1) : clinics;

  const stats = {
    total: clinics.length,
    ativos: clinics.filter(c => c.status === 'ativo').length,
    pendentes: clinics.filter(c => c.status === 'pendente').length,
    inativos: clinics.filter(c => c.status === 'inativo').length,
    totalViews: clinics.reduce((sum, c) => sum + c.views, 0),
    totalBookings: clinics.reduce((sum, c) => sum + c.bookings, 0)
  };

  const appointmentStats = {
    total: appointments.length,
    pending: appointments.filter(appointment => appointment.status === 'pending').length,
    confirmed: appointments.filter(appointment => appointment.status === 'confirmed').length,
    completed: appointments.filter(appointment => appointment.status === 'completed').length,
    cancelled: appointments.filter(appointment => appointment.status === 'cancelled').length
  };
  const completedAppointments = appointments.filter(appointment => appointment.status === 'completed');
  const attendedPatients = completedAppointments.length;
  const workedHours = completedAppointments.length;
  const uniqueClinicsVisited = new Set(
    appointments.map(appointment => appointment.clinic_id).filter(Boolean)
  ).size;
  const totalInvestment = completedAppointments.reduce((sum, appointment) => sum + (appointment.value || 0), 0);
  const cancellationRate = appointmentStats.total > 0
    ? (appointmentStats.cancelled / appointmentStats.total) * 100
    : 0;
  const completionRate = appointmentStats.total > 0
    ? (appointmentStats.completed / appointmentStats.total) * 100
    : 0;

  const today = new Date();
  const recentWeekData = Array.from({ length: 7 }).map((_, index) => {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - (6 - index));
    const currentDateKey = currentDate.toISOString().slice(0, 10);

    const total = appointments.filter(
      appointment => appointment.date && appointment.date.slice(0, 10) === currentDateKey
    ).length;

    return {
      dayLabel: currentDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      total
    };
  });
  const maxWeekAppointments = Math.max(...recentWeekData.map(item => item.total), 1);

  const monthlyTrendData = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const label = monthDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const total = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return !Number.isNaN(appointmentDate.getTime()) &&
        appointmentDate.getFullYear() === year &&
        appointmentDate.getMonth() === month;
    }).length;

    return { label, total };
  });
  const maxMonthlyAppointments = Math.max(...monthlyTrendData.map(item => item.total), 1);

  const statusDistributionData = [
    { label: 'Pendentes', value: appointmentStats.pending, color: 'bg-yellow-500' },
    { label: 'Confirmados', value: appointmentStats.confirmed, color: 'bg-blue-500' },
    { label: 'Concluídos', value: appointmentStats.completed, color: 'bg-green-500' },
    { label: 'Cancelados', value: appointmentStats.cancelled, color: 'bg-red-500' }
  ];

  const weekdayPerformanceMap = completedAppointments.reduce<Record<string, number>>((acc, appointment) => {
    const label = getWeekdayLabel(appointment.date);
    const nextValue = (acc[label] || 0) + 1;
    return { ...acc, [label]: nextValue };
  }, {});
  const weekdayPerformance = Object.entries(weekdayPerformanceMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const bestDay = weekdayPerformance[0]?.label || '-';

  const clinicRevenueRanking = clinics
    .map(clinic => {
      const revenue = appointments
        .filter(
          appointment =>
            appointment.clinic_id === clinic.id &&
            (appointment.status === 'completed' || appointment.status === 'confirmed')
        )
        .reduce((sum, appointment) => sum + (appointment.value || 0), 0);

      return {
        clinicId: clinic.id,
        clinicTitle: clinic.title,
        revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const topRevenueClinic = clinicRevenueRanking[0] || null;
  const bottomRevenueClinic = clinicRevenueRanking.length > 0 ? clinicRevenueRanking[clinicRevenueRanking.length - 1] : null;
  const maxRevenueValue = clinicRevenueRanking[0]?.revenue || 0;

  const projection30Days = financialData.pending + financialData.received;
  const conversionRate = stats.totalViews > 0 ? (stats.totalBookings / stats.totalViews) * 100 : 0;
  const occupancyRate = stats.total > 0 ? (stats.ativos / stats.total) * 100 : 0;

  const handleEditClinic = (id: string) => {
    router.push(`/consultorio/editar/${id}`);
  };

  const handleDeleteClinic = (id: string) => {
    const clinic = clinics.find(c => c.id === id);
    if (!clinic) return;

    setDeleteModal({
      isOpen: true,
      clinicId: id,
      clinicTitle: clinic.title
    });
  };

  const confirmDeleteClinic = async () => {
    if (!deleteModal.clinicId) return;

    try {
      const { clinicUtils } = await import('@/services/clinicService');
      const result = await clinicUtils.deleteClinic(deleteModal.clinicId);

      if (result.success) {
        setClinics(prev => prev.filter(c => c.id !== deleteModal.clinicId));
        showToast('Consultório excluído com sucesso!', 'success');
      } else {
        showToast(`Erro ao excluir consultório: ${result.error || 'Tente novamente.'}`, 'error');
      }
    } catch {
      showToast('Erro ao excluir consultório. Tente novamente.', 'error');
    }

    setDeleteModal({
      isOpen: false,
      clinicId: null,
      clinicTitle: ''
    });
  };

  const cancelDeleteClinic = () => {
    setDeleteModal({
      isOpen: false,
      clinicId: null,
      clinicTitle: ''
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const clinic = clinics.find(c => c.id === id);
      if (!clinic) return;

      const newStatus: DashboardClinic['status'] = clinic.status === 'ativo' ? 'inativo' : 'ativo';
      const targetStatus = newStatus === 'ativo' ? 'active' : 'inactive';
      const { clinicUtils } = await import('@/services/clinicService');
      const result = await clinicUtils.updateClinic(id, { status: targetStatus });

      if (result.success) {
        setClinics(prev =>
          prev.map(c => {
            if (c.id === id) return { ...c, status: newStatus };
            return c;
          })
        );
        showToast(
          newStatus === 'ativo'
            ? 'Consultório ativado com sucesso!'
            : 'Consultório desativado com sucesso!',
          'success'
        );
      } else {
        showToast(`Erro ao alterar status: ${result.error || 'Tente novamente.'}`, 'error');
      }
    } catch {
      showToast('Erro ao alterar status. Tente novamente.', 'error');
    }
  };

  const headerDescription =
    isCompanyFreePanel
      ? 'Empresário Básico: visão completa com gráficos, métricas e indicadores'
      : isCompanyBasicPanel
        ? 'Empresário Básico: visão completa com gráficos, métricas e indicadores'
        : 'Profissional: acompanhe seus agendamentos e encontre consultórios para sublocar';

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel de Controle</h1>
              <p className="text-gray-600">{headerDescription}</p>
            </div>
            {!isProfessionalPanel && (
              <div className="mt-4 sm:mt-0">
                <Link href="/anunciar">
                  <Button variant="primary" size="lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Novo Consultório
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {isCompanyBasicPanel && (
          <>
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg p-6 md:p-8 mb-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-green-100 mb-1">Valor recebido</p>
                  <p className="text-3xl font-bold">
                    {financialData.isLoading ? 'Carregando...' : formatCurrency(financialData.received)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-100 mb-1">Valor a receber</p>
                  <p className="text-3xl font-bold">
                    {financialData.isLoading ? 'Carregando...' : formatCurrency(financialData.pending)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-100 mb-1">Previsão 30 dias</p>
                  <p className="text-3xl font-bold">
                    {financialData.isLoading ? 'Carregando...' : formatCurrency(projection30Days)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Consultórios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Taxa de conversão</p>
                <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Indicadores operacionais</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Ocupação de anúncios ativos</span>
                      <span className="font-semibold text-gray-900">{occupancyRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(occupancyRate, 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Agendamentos concluídos</span>
                      <span className="font-semibold text-gray-900">{appointmentStats.completed}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${Math.min(
                            appointmentStats.total > 0
                              ? (appointmentStats.completed / appointmentStats.total) * 100
                              : 0,
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Agendamentos pendentes</span>
                      <span className="font-semibold text-gray-900">{appointmentStats.pending}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{
                          width: `${Math.min(
                            appointmentStats.total > 0
                              ? (appointmentStats.pending / appointmentStats.total) * 100
                              : 0,
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas de agendamento</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.total}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Confirmados</p>
                    <p className="text-2xl font-bold text-blue-700">{appointmentStats.confirmed}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Concluídos</p>
                    <p className="text-2xl font-bold text-green-700">{appointmentStats.completed}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Cancelados</p>
                    <p className="text-2xl font-bold text-red-700">{appointmentStats.cancelled}</p>
                  </div>
                </div>
              </div>
            </div>

            {clinicRevenueRanking.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ranking de faturamento por consultório</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-semibold text-green-700 mb-1">Consultório que mais fatura</p>
                    <p className="text-base font-semibold text-gray-900">{topRevenueClinic?.clinicTitle || '-'}</p>
                    <p className="text-2xl font-bold text-green-700 mt-2">
                      {formatCurrency(topRevenueClinic?.revenue || 0)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs font-semibold text-orange-700 mb-1">Consultório que menos fatura</p>
                    <p className="text-base font-semibold text-gray-900">{bottomRevenueClinic?.clinicTitle || '-'}</p>
                    <p className="text-2xl font-bold text-orange-700 mt-2">
                      {formatCurrency(bottomRevenueClinic?.revenue || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {clinicRevenueRanking.slice(0, 5).map(item => {
                    const percent = maxRevenueValue > 0 ? (item.revenue / maxRevenueValue) * 100 : 0;

                    return (
                      <div key={item.clinicId} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-medium text-gray-900">{item.clinicTitle}</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                        </div>
                        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                            style={{ width: `${Math.max(percent, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {isProfessionalPanel && (
          <>
            {isLoadingAppointments ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <Loading message="Carregando agendamentos..." description="Aguarde enquanto buscamos seus agendamentos." />
              </div>
            ) : appointmentStats.total === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-8 text-center flex flex-col items-center justify-center gap-4">
                  <p className="text-gray-600">Você ainda não possui agendamentos. Busque um consultório para começar.</p>
                  <Link href="/sublocar">
                    <Button variant="primary" size="md">
                      Buscar consultórios
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Total de agendamentos</p>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.total}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Pacientes atendidos</p>
                    <p className="text-2xl font-bold text-gray-900">{attendedPatients}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Horas trabalhadas</p>
                    <p className="text-2xl font-bold text-gray-900">{workedHours}h</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-700">{appointmentStats.pending}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Confirmados</p>
                    <p className="text-2xl font-bold text-blue-700">{appointmentStats.confirmed}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Concluídos</p>
                    <p className="text-2xl font-bold text-green-700">{appointmentStats.completed}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Produtividade dos últimos 7 dias</h2>
                    <div className="space-y-3">
                      {recentWeekData.map(item => {
                        const percent = (item.total / maxWeekAppointments) * 100;
                        return (
                          <div key={item.dayLabel}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600 uppercase">{item.dayLabel}</span>
                              <span className="font-semibold text-gray-900">{item.total}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-100">
                              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.max(percent, item.total > 0 ? 8 : 0)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição dos agendamentos</h2>
                    <div className="space-y-3">
                      {statusDistributionData.map(item => {
                        const percent = appointmentStats.total > 0 ? (item.value / appointmentStats.total) * 100 : 0;
                        return (
                          <div key={item.label}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">{item.label}</span>
                              <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-100">
                              <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.max(percent, item.value > 0 ? 8 : 0)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução mensal de atendimentos</h2>
                  <div className="grid grid-cols-6 gap-3 items-end h-44">
                    {monthlyTrendData.map(item => {
                      const heightPercent = (item.total / maxMonthlyAppointments) * 100;
                      return (
                        <div key={item.label} className="flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-[#2b9af3] to-blue-400"
                            style={{ height: `${Math.max(heightPercent, item.total > 0 ? 10 : 0)}%` }}
                          />
                          <p className="text-xs text-gray-500 mt-2 uppercase">{item.label}</p>
                          <p className="text-xs font-semibold text-gray-900">{item.total}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Taxa de conclusão</p>
                    <p className="text-2xl font-bold text-green-700">{completionRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Taxa de cancelamento</p>
                    <p className="text-2xl font-bold text-red-700">{cancellationRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Consultórios atendidos</p>
                    <p className="text-2xl font-bold text-gray-900">{uniqueClinicsVisited}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-600">Melhor dia de atendimento</p>
                    <p className="text-2xl font-bold text-gray-900 uppercase">{bestDay}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Resumo de performance</h2>
                  <p className="text-gray-600">
                    Você já concluiu <strong>{attendedPatients}</strong> atendimentos e acumulou aproximadamente{' '}
                    <strong>{workedHours}h</strong> de trabalho no período analisado.
                  </p>
                  <p className="text-gray-600 mt-2">
                    Investimento estimado em atendimentos concluídos: <strong>{formatCurrency(totalInvestment)}</strong>.
                  </p>
                </div>

              </>
            )}
          </>
        )}

        {!isCompanyFreePanel && !isProfessionalPanel && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Meus Consultórios
            </h2>
          </div>
        )}

        {!isProfessionalPanel && (
          <div className="space-y-6">
            {isLoadingClinics ? (
              <Loading message="Carregando consultórios..." description="Aguarde enquanto buscamos seus consultórios." />
            ) : clinicsForPanel.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum consultório encontrado</h3>
                <p className="text-gray-600 mb-6">Você ainda não cadastrou consultório.</p>
                <div className="flex justify-center">
                  <Link href="/anunciar">
                    <Button variant="primary" size="lg">
                      Cadastrar Primeiro Consultório
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              clinicsForPanel.map(clinic => (
                <ClinicCard
                  key={clinic.id}
                  clinic={{
                    id: clinic.id,
                    title: clinic.title,
                    address: clinic.address,
                    price: clinic.price,
                    specialty: clinic.specialty,
                    status: clinic.status,
                    images: clinic.images,
                    views: clinic.views,
                    bookings: clinic.bookings,
                    rating: clinic.rating
                  }}
                  onEdit={handleEditClinic}
                  onDelete={handleDeleteClinic}
                  onToggleStatus={handleToggleStatus}
                  showActions={true}
                />
              ))
            )}
          </div>
        )}

        {isCompanyFreePanel && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Agendamentos</h2>
              <Link href="/agendamentos">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>

            {isLoadingAppointments ? (
              <Loading message="Carregando agendamentos..." description="Aguarde enquanto buscamos os agendamentos." />
            ) : appointments.length === 0 ? (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 text-center">
                <p className="text-gray-600">Nenhum agendamento encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 6).map(appointment => (
                  <div key={appointment.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{appointment.clinic_title || 'Consultório'}</p>
                        <p className="text-sm text-gray-600">
                          {formatAppointmentDate(appointment.date)} {appointment.time ? `- ${appointment.time}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getAppointmentStatusStyle(appointment.status)}`}>
                          {getAppointmentStatusText(appointment.status)}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(appointment.value || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={cancelDeleteClinic}
        title="Confirmar Exclusão"
        subtitle="Esta ação não pode ser desfeita"
        size="sm"
        primaryButton={{
          text: 'Excluir',
          onClick: confirmDeleteClinic,
          loading: false,
          variant: 'danger'
        }}
        secondaryButton={{
          text: 'Cancelar',
          onClick: cancelDeleteClinic
        }}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tem certeza que deseja excluir este consultório?</h3>
          <p className="text-sm text-gray-500 mb-4">
            <strong>&quot;{deleteModal.clinicTitle}&quot;</strong> será permanentemente removido.
          </p>
          <p className="text-xs text-gray-400">Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ControlPanelPage;
