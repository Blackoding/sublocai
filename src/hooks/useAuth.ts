import { useState, useEffect } from 'react';

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

      // Verificar se há token de autenticação no localStorage
      const token = localStorage.getItem('sb-nmxcqiwslkuvdydlsolm-auth-token');
      if (!token) {
        return { success: false, user: null, error: 'No authentication token' };
      }

      // Buscar dados do usuário usando fetch direto
      const response = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?select=*&limit=1', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': `Bearer ${token}`,
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

    // Listener para mudanças no localStorage (quando o usuário faz login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sb-nmxcqiwslkuvdydlsolm-auth-token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Verificar periodicamente se o token mudou
    const interval = setInterval(() => {
      const token = localStorage.getItem('sb-nmxcqiwslkuvdydlsolm-auth-token');
      if (token && !user) {
        checkAuth();
      } else if (!token && user) {
        setUser(null);
        setIsAuthenticated(false);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  return {
    isAuthenticated,
    user,
    isLoading
  };
};
