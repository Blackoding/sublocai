import { useState, useEffect } from 'react';

interface Owner {
  name: string;
  phone: string;
  email: string;
}

interface UseOwnerResult {
  owner: Owner | null;
  isLoading: boolean;
  error: string | null;
}

export const useOwner = (userId: string | null): UseOwnerResult => {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchOwner = async () => {
      if (!userId) {
        setOwner(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await getCurrentUser();

        if (result.success && result.user) {
          // console.log('✅ Dados do usuário encontrados:', result.user);
          setOwner({
            name: result.user.full_name || result.user.fullName,
            phone: result.user.phone || '(11) 99999-9999',
            email: result.user.email
          });
        } else {
          // console.warn('⚠️ Usuário não encontrado para o ID:', userId);
          setError(result.error || 'Usuário não encontrado');
          setOwner(null);
        }
      } catch (err) {
        // console.error('❌ Erro inesperado ao buscar owner:', err);
        setError(err instanceof Error ? err.message : 'Erro inesperado');
        setOwner(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwner();
  }, [userId]);

  return {
    owner,
    isLoading,
    error
  };
};
