import { useState, useEffect } from 'react';
import { AppointmentService } from '@/services/appointmentService';
import { Appointment, AppointmentFilters } from '@/types';

export const useAppointments = (clinicId?: string, filters?: AppointmentFilters, userId?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });

  const loadAppointments = async () => {
    console.log('useAppointments - loadAppointments iniciado');
    console.log('useAppointments - clinicId:', clinicId);
    console.log('useAppointments - clinicId type:', typeof clinicId);
    console.log('useAppointments - clinicId length:', clinicId?.length);
    console.log('useAppointments - filters:', filters);
    console.log('useAppointments - userId:', userId);
    
    // Usar clinicId do filtro se disponível, senão usar o clinicId padrão
    const targetClinicId = filters?.clinic_id || clinicId;
    console.log('useAppointments - targetClinicId:', targetClinicId);
    
    // Se não há clinicId específico e não há userId, não carregar agendamentos
    if (!targetClinicId && !userId) {
      console.log('useAppointments - Nenhum clinicId ou userId fornecido, aguardando seleção');
      setAppointments([]);
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0
      });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log('useAppointments - Chamando AppointmentService...');
      
      // Testar conexão primeiro
      const connectionTest = await AppointmentService.testConnection();
      console.log('useAppointments - Teste de conexão:', connectionTest);
      
      let appointmentsResult;
      let statsResult;

      // Se não há clinicId específico (filtro "Todos os Consultórios"), buscar todos os agendamentos do usuário
      if (!targetClinicId && userId) {
        console.log('useAppointments - Buscando todos os agendamentos do usuário');
        appointmentsResult = await AppointmentService.getAllUserAppointments(userId, filters);
        
        // Para estatísticas, vamos calcular manualmente
        if (appointmentsResult.data) {
          const total = appointmentsResult.data.length;
          const pending = appointmentsResult.data.filter(apt => apt.status === 'pending').length;
          const confirmed = appointmentsResult.data.filter(apt => apt.status === 'confirmed').length;
          const cancelled = appointmentsResult.data.filter(apt => apt.status === 'cancelled').length;
          const completed = appointmentsResult.data.filter(apt => apt.status === 'completed').length;
          
          statsResult = {
            data: { total, pending, confirmed, cancelled, completed },
            error: null
          };
        } else {
          statsResult = {
            data: { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 },
            error: null
          };
        }
      } else {
        // Buscar agendamentos de um consultório específico
        console.log('useAppointments - Buscando agendamentos do consultório específico');
        [appointmentsResult, statsResult] = await Promise.all([
          AppointmentService.getAppointmentsByClinic(targetClinicId!, filters),
          AppointmentService.getAppointmentStats(targetClinicId!)
        ]);
      }

      console.log('useAppointments - appointmentsResult:', appointmentsResult);
      console.log('useAppointments - statsResult:', statsResult);

      if (appointmentsResult.error) {
        console.log('useAppointments - Erro nos agendamentos:', appointmentsResult.error);
        setError(appointmentsResult.error);
      } else {
        console.log('useAppointments - Agendamentos carregados:', appointmentsResult.data?.length || 0);
        setAppointments(appointmentsResult.data || []);
      }

      if (statsResult.error) {
        console.error('useAppointments - Erro ao carregar estatísticas:', statsResult.error);
      } else {
        console.log('useAppointments - Estatísticas carregadas:', statsResult.data);
        setStats(statsResult.data || {
          total: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0
        });
      }
    } catch (err) {
      console.error('useAppointments - Erro inesperado:', err);
      setError('Erro inesperado ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const result = await AppointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Recarregar agendamentos
        await loadAppointments();
        return true;
      }
    } catch (err) {
      setError('Erro ao atualizar agendamento');
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    console.log('useAppointments - useEffect clinicId executado');
    console.log('useAppointments - clinicId no useEffect:', clinicId);
    console.log('useAppointments - userId no useEffect:', userId);
    if ((clinicId && clinicId.trim() !== '') || userId) {
      console.log('useAppointments - Chamando loadAppointments...');
      loadAppointments();
    } else {
      console.log('useAppointments - clinicId e userId inválidos, não carregando');
    }
  }, [clinicId, userId]);

  // useEffect separado para filtros
  useEffect(() => {
    console.log('useAppointments - useEffect filtros executado');
    console.log('useAppointments - clinicId nos filtros:', clinicId);
    console.log('useAppointments - filters nos filtros:', filters);
    console.log('useAppointments - userId nos filtros:', userId);
    if (((clinicId && clinicId.trim() !== '') || userId) && filters) {
      console.log('useAppointments - Chamando loadAppointments com filtros...');
      loadAppointments();
    } else {
      console.log('useAppointments - Condições não atendidas para carregar com filtros');
    }
  }, [filters?.date_from, filters?.date_to, filters?.period, filters?.day_of_week, filters?.status, filters?.clinic_id]);

  return {
    appointments,
    loading,
    error,
    stats,
    loadAppointments,
    updateAppointmentStatus
  };
};
