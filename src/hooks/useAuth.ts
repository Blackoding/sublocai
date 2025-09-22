import { useState, useEffect } from 'react';
import { getSupabaseAuthClient } from '@/services/supabase';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      // Só executa no cliente
      if (typeof window === 'undefined') {
        return { success: false, user: null, error: 'Server side execution not allowed' };
      }

      // Usar o cliente Supabase para obter a sessão atual
      const supabase = getSupabaseAuthClient();
      
      // Adicionar timeout para evitar travamento
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao obter sessão')), 3000)
      );
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: unknown }, error: unknown };
      
      if (error) {
        return { success: false, user: null, error: (error as { message: string }).message || 'Erro desconhecido' };
      }
      
      if (!session) {
        return { success: false, user: null, error: 'No active session' };
      }

      // Buscar dados do usuário usando o ID da sessão
      const sessionData = session as { user: { id: string }; access_token: string };
      const response = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?select=*&id=eq.' + sessionData.user.id, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': `Bearer ${sessionData.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, user: null, error: 'Failed to fetch user data' };
      }

      const users = await response.json();
      if (users && users.length > 0) {
        return { success: true, user: users[0], error: null };
      }

      return { success: false, user: null, error: 'User not found' };
    } catch (error) {
      return { success: false, user: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Só executa no cliente
        if (typeof window === 'undefined') {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const result = await getCurrentUser();
        
        if (result.success && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        // console.warn('Error checking auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listener para mudanças de autenticação do Supabase
    const supabase = getSupabaseAuthClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    isAuthenticated,
    user,
    isLoading
  };
};
