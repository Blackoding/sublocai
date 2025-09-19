import { useState, useCallback } from 'react';
import { getSupabaseClient } from './supabase';
import { User, SignUpData, SignInData, AuthResponse, ProfileUpdateData } from '@/types';

// Hook para gerenciar autenticação
export const useAuthService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async (data: SignUpData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: 'Server side execution not allowed' };
      }

      const supabase = getSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            cpf: data.cpf,
            phone: data.phone,
            birth_date: data.birthDate
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        setError('Failed to create user');
        return { user: null, error: 'Failed to create user' };
      }

      // Create user profile in database using admin client to bypass RLS
      const { supabaseAdmin } = await import('./supabase');
      const { data: profileData, error: profileError } = await supabaseAdmin()
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          cpf: data.cpf,
          phone: data.phone,
          birth_date: data.birthDate,
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        try {
          await supabaseAdmin().auth.admin.deleteUser(authData.user.id);
        } catch {
          // Silent cleanup error
        }
        setError(profileError.message);
        return { user: null, error: profileError.message };
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        cpf: profileData.cpf,
        phone: profileData.phone,
        birthDate: profileData.birth_date,
        avatar: profileData.avatar,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        user: null, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (data: SignInData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: 'Server side execution not allowed' };
      }

      const supabase = getSupabaseClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        setError('Login failed');
        return { user: null, error: 'Login failed' };
      }

      // Get user profile from database using fetch direto
      const profileResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${authData.user.id}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': `Bearer ${authData.session?.access_token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        setError('Failed to load user profile');
        return { user: null, error: 'Failed to load user profile' };
      }

      const profileDataArray = await profileResponse.json();
      const profileData = profileDataArray[0];

      if (!profileData) {
        setError('User profile not found');
        return { user: null, error: 'User profile not found' };
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        cpf: profileData.cpf,
        phone: profileData.phone,
        birthDate: profileData.birth_date,
        avatar: profileData.avatar,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        user: null, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { error: 'Server side execution not allowed' };
      }

      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async (): Promise<AuthResponse> => {
    try {
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: null };
      }

      const supabase = getSupabaseClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return { user: null, error: null }; // Não é um erro, apenas não há usuário logado
      }

      // Get user profile from database using fetch direto
      const profileResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${authUser.id}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': `Bearer ${(authUser as { access_token?: string }).access_token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        return { user: null, error: 'Failed to load user profile' };
      }

      const profileDataArray = await profileResponse.json();
      const profileData = profileDataArray[0];

      if (!profileData) {
        return { user: null, error: 'User profile not found' };
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        cpf: profileData.cpf,
        phone: profileData.phone,
        birthDate: profileData.birth_date,
        avatar: profileData.avatar,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updates: ProfileUpdateData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: 'Server side execution not allowed' };
      }

      // Update user profile using fetch direto
      // Filtrar campos vazios para evitar problemas de validação
      const requestBody: Record<string, string> = {};
      
      if (updates.fullName && updates.fullName.trim()) {
        requestBody.full_name = updates.fullName.trim();
      }
      if (updates.cpf && updates.cpf.trim()) {
        // Limpar CPF removendo formatação (pontos, traços, espaços)
        const cleanCpf = updates.cpf.replace(/\D/g, '');
        if (cleanCpf.length === 11) {
          requestBody.cpf = cleanCpf;
        }
      }
      if (updates.phone && updates.phone.trim()) {
        // Limpar telefone removendo formatação
        const cleanPhone = updates.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
          requestBody.phone = cleanPhone;
        }
      }
      if (updates.birthDate && updates.birthDate.trim()) {
        requestBody.birth_date = updates.birthDate.trim();
      }
      if (updates.avatar && updates.avatar.trim()) {
        requestBody.avatar = updates.avatar.trim();
      }
      
      // Adicionar timestamp de atualização
      requestBody.updated_at = new Date().toISOString();

      console.log('UpdateProfile (hook) - Request URL:', `https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${userId}`);
      console.log('UpdateProfile (hook) - Request Body:', requestBody);
      console.log('UpdateProfile (hook) - Updates received:', updates);

      const updateResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('UpdateProfile (hook) - Response status:', updateResponse.status);
      console.log('UpdateProfile (hook) - Response ok:', updateResponse.ok);

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('UpdateProfile (hook) - Error response:', errorData);
        setError(errorData.message || 'Failed to update profile');
        return { user: null, error: errorData.message || 'Failed to update profile' };
      }

      const dataArray = await updateResponse.json();
      const data = dataArray[0];

      if (!data) {
        setError('Profile not found after update');
        return { user: null, error: 'Profile not found after update' };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        cpf: data.cpf,
        phone: data.phone,
        birthDate: data.birth_date,
        avatar: data.avatar,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        user: null, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    updateProfile,
    isLoading,
    error
  };
};

// Utility functions for direct use (without hooks)
export const authUtils = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: 'Server side execution not allowed' };
      }

      const supabase = getSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            cpf: data.cpf,
            phone: data.phone,
            birth_date: data.birthDate
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user' };
      }

      // Create user profile in database using admin client to bypass RLS
      const { supabaseAdmin } = await import('./supabase');
      const { data: profileData, error: profileError } = await supabaseAdmin()
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          cpf: data.cpf,
          phone: data.phone,
          birth_date: data.birthDate,
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        try {
          await supabaseAdmin().auth.admin.deleteUser(authData.user.id);
        } catch {
          // Silent cleanup error
        }
        return { user: null, error: profileError.message };
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        cpf: profileData.cpf,
        phone: profileData.phone,
        birthDate: profileData.birth_date,
        avatar: profileData.avatar,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: 'Server side execution not allowed' };
      }

      const supabase = getSupabaseClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Login failed' };
      }
      console.log('authData.user.id:', authData.user.id);

      // Get user profile from database using fetch direto
      const profileResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${authData.user.id}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': `Bearer ${authData.session?.access_token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        return { user: null, error: 'Failed to load user profile' };
      }

      const profileDataArray = await profileResponse.json();
      const profileData = profileDataArray[0];

      if (!profileData) {
        return { user: null, error: 'User profile not found' };
      }
      console.log('profileData:', profileData);
      const user: User = {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        cpf: profileData.cpf,
        phone: profileData.phone,
        birthDate: profileData.birth_date,
        avatar: profileData.avatar,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      console.log('authUtils.signOut - Iniciado');
      // Só executa no cliente
      if (typeof window === 'undefined') {
        console.log('authUtils.signOut - Server side execution not allowed');
        return { error: 'Server side execution not allowed' };
      }

      console.log('authUtils.signOut - Obtendo cliente Supabase');
      const supabase = getSupabaseClient();
      console.log('authUtils.signOut - Cliente Supabase obtido, chamando signOut');
      
      const { error } = await supabase.auth.signOut();
      console.log('authUtils.signOut - signOut concluído, error:', error);

      if (error) {
        console.log('authUtils.signOut - Erro no signOut:', error.message);
        return { error: error.message };
      }

      console.log('authUtils.signOut - Sucesso, retornando null');
      return { error: null };
    } catch (error) {
      console.log('authUtils.signOut - Exceção capturada:', error);
      return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: null };
      }

      const supabase = getSupabaseClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return { user: null, error: null }; // Não é um erro, apenas não há usuário logado
      }

      // Get user profile from database using fetch direto
      const profileResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${authUser.id}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': `Bearer ${(authUser as { access_token?: string }).access_token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        return { user: null, error: 'Failed to load user profile' };
      }

      const profileDataArray = await profileResponse.json();
      const profileData = profileDataArray[0];

      if (!profileData) {
        return { user: null, error: 'User profile not found' };
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        cpf: profileData.cpf,
        phone: profileData.phone,
        birthDate: profileData.birth_date,
        avatar: profileData.avatar,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  async updateProfile(userId: string, updates: ProfileUpdateData): Promise<AuthResponse> {
    try {
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { user: null, error: 'Server side execution not allowed' };
      }

      // Update user profile using fetch direto
      // Filtrar campos vazios para evitar problemas de validação
      const requestBody: Record<string, string> = {};
      
      if (updates.fullName && updates.fullName.trim()) {
        requestBody.full_name = updates.fullName.trim();
      }
      if (updates.cpf && updates.cpf.trim()) {
        // Limpar CPF removendo formatação (pontos, traços, espaços)
        const cleanCpf = updates.cpf.replace(/\D/g, '');
        if (cleanCpf.length === 11) {
          requestBody.cpf = cleanCpf;
        }
      }
      if (updates.phone && updates.phone.trim()) {
        // Limpar telefone removendo formatação
        const cleanPhone = updates.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
          requestBody.phone = cleanPhone;
        }
      }
      if (updates.birthDate && updates.birthDate.trim()) {
        requestBody.birth_date = updates.birthDate.trim();
      }
      if (updates.avatar && updates.avatar.trim()) {
        requestBody.avatar = updates.avatar.trim();
      }
      
      // Adicionar timestamp de atualização
      requestBody.updated_at = new Date().toISOString();

      console.log('UpdateProfile (utils) - Request URL:', `https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${userId}`);
      console.log('UpdateProfile (utils) - Request Body:', requestBody);
      console.log('UpdateProfile (utils) - Updates received:', updates);

      const updateResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('UpdateProfile (utils) - Response status:', updateResponse.status);
      console.log('UpdateProfile (utils) - Response ok:', updateResponse.ok);

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('UpdateProfile (utils) - Error response:', errorData);
        return { user: null, error: errorData.message || 'Failed to update profile' };
      }

      const dataArray = await updateResponse.json();
      const data = dataArray[0];

      if (!data) {
        return { user: null, error: 'Profile not found after update' };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        cpf: data.cpf,
        phone: data.phone,
        birthDate: data.birth_date,
        avatar: data.avatar,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
};