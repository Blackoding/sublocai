import { Appointment, AppointmentFilters } from '@/types';
// import { getSupabaseAuthClient } from './supabase'; // Não utilizado

// Interfaces para tipagem
interface ClinicResponse {
  id: string;
}

interface AppointmentResponse {
  clinic_id: string;
  date: string;
  time: string;
  [key: string]: unknown;
}

interface UserResponse {
  id: string;
  [key: string]: unknown;
}

const SUPABASE_URL = 'https://nmxcqiwslkuvdydlsolm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0';

// Usando sempre service role key para evitar problemas de timeout com tokens de usuário
// VERSÃO ATUALIZADA - SEM TIMEOUTS - 2025-01-21
// VERSÃO COM BUSCA DE USUÁRIOS - 2025-01-21-21:15
// VERSÃO FINAL COM FETCH DIRETO - 2025-01-21-21:20
console.log('📁 AppointmentService carregado - VERSÃO COM FETCH DIRETO');

export class AppointmentService {
  // Método de teste para verificar conexão
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AppointmentService - Testando conexão...');
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log('AppointmentService - Status da resposta (teste):', response.status);
      
      if (response.ok) {
        console.log('AppointmentService - Conexão OK');
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('AppointmentService - Erro na conexão:', errorData);
        return { success: false, error: errorData.message || 'Erro na conexão' };
      }
    } catch (error) {
      console.error('AppointmentService - Erro inesperado no teste:', error);
      return { success: false, error: 'Erro inesperado' };
    }
  }

  // Buscar agendamentos de todos os consultórios do usuário
  static async getAllUserAppointments(
    userId: string,
    filters?: AppointmentFilters
  ): Promise<{ data: Appointment[] | null; error: string | null }> {
    try {
      console.log('AppointmentService - getAllUserAppointments iniciado');
      console.log('AppointmentService - UserId:', userId);
      console.log('AppointmentService - Filters:', filters);
      
      // Usar sempre service role key para evitar timeouts
      const authToken = SUPABASE_SERVICE_KEY;
      console.log('AppointmentService - Usando service role key para todos os agendamentos');

      // Construir query string para buscar agendamentos de todos os consultórios do usuário
      const queryParams = new URLSearchParams();
      queryParams.append('order', 'date.asc,time.asc');
      queryParams.append('select', '*,users(*)');
      
      console.log('AppointmentService - Query params antes da URL:', queryParams.toString());

      // Aplicar filtros básicos
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          queryParams.append('status', `eq.${filters.status}`);
        }
        // Outros filtros serão aplicados no lado do cliente
      }

      const url = `${SUPABASE_URL}/rest/v1/appointments?${queryParams.toString()}`;
      console.log('AppointmentService - URL da requisição (todos):', url);
      console.log('AppointmentService - Query params (todos):', queryParams.toString());
      
      // Fazer requisição com o token disponível
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('AppointmentService - Status da resposta (todos):', response.status);
      console.log('AppointmentService - Headers da resposta (todos):', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AppointmentService - Erro ao buscar todos os agendamentos:', errorData);
        return { data: null, error: errorData.message || 'Erro ao buscar agendamentos' };
      }

      const data = await response.json();
      console.log('AppointmentService - Dados recebidos (todos):', data);

      // Filtrar apenas agendamentos dos consultórios do usuário
      // Primeiro, buscar os IDs dos consultórios do usuário
      const clinicsResponse = await fetch(`${SUPABASE_URL}/rest/v1/clinics?user_id=eq.${userId}&select=id`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!clinicsResponse.ok) {
        console.error('AppointmentService - Erro ao buscar consultórios do usuário');
        return { data: null, error: 'Erro ao buscar consultórios do usuário' };
      }

      const userClinics = await clinicsResponse.json() as ClinicResponse[];
      const userClinicIds = userClinics.map((clinic) => clinic.id);
      console.log('AppointmentService - IDs dos consultórios do usuário:', userClinicIds);

      // Filtrar agendamentos apenas dos consultórios do usuário
      const filteredAppointments = data.filter((appointment: AppointmentResponse) => 
        userClinicIds.includes(appointment.clinic_id)
      );

      console.log('AppointmentService - Agendamentos filtrados (todos):', filteredAppointments.length);

      // Aplicar filtros adicionais no lado do cliente
      let finalAppointments = filteredAppointments;

      if (filters) {
        if (filters.date_from) {
          finalAppointments = finalAppointments.filter((apt: AppointmentResponse) => 
            apt.date >= filters.date_from!
          );
        }
        if (filters.date_to) {
          finalAppointments = finalAppointments.filter((apt: AppointmentResponse) => 
            apt.date <= filters.date_to!
          );
        }
        if (filters.period && filters.period !== 'all') {
          finalAppointments = finalAppointments.filter((apt: AppointmentResponse) => {
            const hour = parseInt(apt.time.split(':')[0]);
            switch (filters.period) {
              case 'morning': return hour >= 6 && hour < 12;
              case 'afternoon': return hour >= 12 && hour < 18;
              case 'evening': return hour >= 18 && hour <= 23;
              default: return true;
            }
          });
        }
        if (filters.day_of_week && filters.day_of_week !== 'all') {
          finalAppointments = finalAppointments.filter((apt: AppointmentResponse) => {
            const date = new Date(apt.date);
            const dayOfWeek = date.getDay();
            const dayMap: { [key: string]: number } = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
              'thursday': 4, 'friday': 5, 'saturday': 6
            };
            return dayOfWeek === dayMap[filters.day_of_week!];
          });
        }
      }

      console.log('AppointmentService - Agendamentos finais (todos):', finalAppointments.length);

      return { data: finalAppointments, error: null };
    } catch (error) {
      console.error('AppointmentService - Erro inesperado ao buscar todos os agendamentos:', error);
      return { data: null, error: 'Erro inesperado ao buscar agendamentos' };
    }
  }

  // Buscar agendamentos de um consultório específico COM USUÁRIOS - VERSÃO FINAL COM FETCH
  static async getAppointmentsByClinic(
    clinicId: string,
    filters?: AppointmentFilters
  ): Promise<{ data: Appointment[] | null; error: string | null }> {
    try {
      console.log('🚨🚨🚨🚨🚨 FORÇANDO RELOAD - VERSÃO 2025-01-21-21:20 COM FETCH DIRETO 🚨🚨🚨🚨🚨');
      console.log('AppointmentService - ClinicId:', clinicId);
      console.log('AppointmentService - ClinicId type:', typeof clinicId);
      console.log('AppointmentService - ClinicId length:', clinicId?.length);
      console.log('AppointmentService - Filters:', filters);
      
      // Usar sempre service role key para evitar timeouts
      const authToken = SUPABASE_SERVICE_KEY;
      console.log('AppointmentService - Usando service role key (sem timeout)');

      // Construir query string para filtros com JOIN para dados do usuário
      const queryParams = new URLSearchParams();
      queryParams.append('clinic_id', `eq.${clinicId}`);
      queryParams.append('order', 'date.asc,time.asc');
      queryParams.append('select', '*,users(*)');
      
      console.log('AppointmentService - Query params antes da URL:', queryParams.toString());

      // Aplicar filtros básicos
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          queryParams.append('status', `eq.${filters.status}`);
        }
        // Outros filtros serão aplicados no lado do cliente
      }

      const url = `${SUPABASE_URL}/rest/v1/appointments?${queryParams.toString()}`;
      console.log('AppointmentService - URL da requisição:', url);
      console.log('AppointmentService - Query params:', queryParams.toString());
      
      // Fazer requisição com o token disponível
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('AppointmentService - Status da resposta:', response.status);
      console.log('AppointmentService - Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AppointmentService - Erro ao buscar agendamentos:', errorData);
        return { data: null, error: errorData.message || 'Erro ao buscar agendamentos' };
      }

      const data = await response.json();
      console.log('AppointmentService - Dados recebidos:', data);
      console.log('AppointmentService - Primeiro agendamento:', data?.[0]);
      console.log('AppointmentService - Dados do usuário no primeiro agendamento:', data?.[0]?.users);
      console.log('AppointmentService - Chaves do primeiro agendamento:', Object.keys(data?.[0] || {}));

      // Se não houver dados de usuário no JOIN, buscar separadamente
      let appointments: Appointment[] = data?.map((item: AppointmentResponse) => ({
        ...item,
        clinic_title: 'Consultório' // Placeholder, pode ser melhorado depois
      })) || [];

      // Sempre buscar dados do usuário separadamente para garantir que funcionem
      if (appointments.length > 0) {
        console.log('🔍 AppointmentService - BUSCANDO USUÁRIOS SEPARADAMENTE...');
        
        // Buscar dados dos usuários
        const userIds = [...new Set(appointments.map(apt => apt.user_id))];
        console.log('AppointmentService - IDs dos usuários:', userIds);
        
        if (userIds.length > 0) {
          const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&id=in.(${userIds.join(',')})`, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log('AppointmentService - Dados dos usuários:', usersData);
            
            // Combinar dados dos usuários com os agendamentos
            appointments = appointments.map(appointment => ({
              ...appointment,
              users: usersData.find((user: UserResponse) => user.id === appointment.user_id)
            }));
            
            console.log('AppointmentService - Agendamentos com usuários:', appointments);
          }
        }
      }

      // Aplicar filtros no lado do cliente
      if (filters?.date_from) {
        appointments = appointments.filter(appointment => {
          return appointment.date >= filters.date_from!;
        });
      }

      if (filters?.date_to) {
        appointments = appointments.filter(appointment => {
          return appointment.date <= filters.date_to!;
        });
      }

      if (filters?.day_of_week && filters.day_of_week !== 'all') {
        const dayMap = {
          'monday': 1,
          'tuesday': 2,
          'wednesday': 3,
          'thursday': 4,
          'friday': 5,
          'saturday': 6,
          'sunday': 0
        };
        const dayNumber = dayMap[filters.day_of_week];
        
        appointments = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate.getDay() === dayNumber;
        });
      }

      // Aplicar filtro de período no lado do cliente
      if (filters?.period && filters.period !== 'all') {
        appointments = appointments.filter(appointment => {
          const time = appointment.time;
          switch (filters.period) {
            case 'morning':
              return time >= '06:00' && time < '12:00';
            case 'afternoon':
              return time >= '12:00' && time < '18:00';
            case 'evening':
              return time >= '18:00' && time <= '23:59';
            default:
              return true;
          }
        });
      }

      console.log('AppointmentService - Agendamentos filtrados:', appointments.length);
      return { data: appointments, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar agendamentos:', error);
      return { data: null, error: 'Erro inesperado ao buscar agendamentos' };
    }
  }

  // Atualizar status de um agendamento
  static async updateAppointmentStatus(
    appointmentId: string, 
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<{ data: Appointment | null; error: string | null }> {
    try {
      // Usar sempre service role key para evitar timeouts
      const authToken = SUPABASE_SERVICE_KEY;
      console.log('AppointmentService - Usando service role key (updateStatus, sem timeout)');

      const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?id=eq.${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao atualizar agendamento:', errorData);
        return { data: null, error: errorData.message || 'Erro ao atualizar agendamento' };
      }

      const data = await response.json();
      return { data: data[0] || null, error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar agendamento:', error);
      return { data: null, error: 'Erro inesperado ao atualizar agendamento' };
    }
  }

  // Buscar estatísticas de agendamentos
  static async getAppointmentStats(clinicId: string): Promise<{
    data: {
      total: number;
      pending: number;
      confirmed: number;
      cancelled: number;
      completed: number;
    } | null;
    error: string | null;
  }> {
    try {
      // Usar sempre service role key para evitar timeouts
      const authToken = SUPABASE_SERVICE_KEY;
      console.log('AppointmentService - Usando service role key (stats, sem timeout)');

      // Fazer requisição com o token disponível
      const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?clinic_id=eq.${clinicId}&select=status`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao buscar estatísticas:', errorData);
        return { data: null, error: errorData.message || 'Erro ao buscar estatísticas' };
      }

      const data = await response.json();


      const stats = {
        total: data?.length || 0,
        pending: data?.filter((item: { status: string }) => item.status === 'pending').length || 0,
        confirmed: data?.filter((item: { status: string }) => item.status === 'confirmed').length || 0,
        cancelled: data?.filter((item: { status: string }) => item.status === 'cancelled').length || 0,
        completed: data?.filter((item: { status: string }) => item.status === 'completed').length || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar estatísticas:', error);
      return { data: null, error: 'Erro inesperado ao buscar estatísticas' };
    }
  }

  // Criar múltiplos agendamentos (um para cada horário selecionado)
  static async createAppointments(appointmentData: {
    clinic_id: string;
    user_id: string;
    date: string;
    selected_times: string[];
    notes?: string;
    value: number; // Valor por sessão
  }): Promise<{ data: Appointment[] | null; error: string | null }> {
    try {
      // Usar sempre service role key para evitar timeouts
      const authToken = SUPABASE_SERVICE_KEY;
      console.log('AppointmentService - Usando service role key (createAppointment, sem timeout)');

      // Criar um array de agendamentos, um para cada horário selecionado
      const appointmentsToCreate = appointmentData.selected_times.map(time => ({
        clinic_id: appointmentData.clinic_id,
        user_id: appointmentData.user_id,
        date: appointmentData.date,
        time: time,
        notes: appointmentData.notes,
        value: appointmentData.value,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(appointmentsToCreate)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao criar agendamentos:', errorData);
        return { data: null, error: errorData.message || 'Erro ao criar agendamentos' };
      }

      const data = await response.json();
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar agendamentos:', error);
      return { data: null, error: 'Erro inesperado ao criar agendamentos' };
    }
  }

  // Método legado para compatibilidade - criar um único agendamento
  static async createAppointment(appointmentData: {
    clinic_id: string;
    user_id: string;
    date: string;
    time: string;
    notes?: string;
    value: number;
  }): Promise<{ data: Appointment | null; error: string | null }> {
    try {
      const result = await this.createAppointments({
        ...appointmentData,
        selected_times: [appointmentData.time]
      });

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data?.[0] || null, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar agendamento:', error);
      return { data: null, error: 'Erro inesperado ao criar agendamento' };
    }
  }

}
