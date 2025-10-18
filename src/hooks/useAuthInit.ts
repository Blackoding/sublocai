import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuthInit = () => {
  const { getCurrentUser, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Só tenta carregar o usuário se estivermos no cliente
    if (typeof window !== 'undefined') {
      console.log('useAuthInit - Iniciando verificação de autenticação...');
      console.log('useAuthInit - Estado atual:', { user: !!user, isAuthenticated });
      
      // Sempre tenta buscar o usuário atual para sincronizar com o Supabase
      getCurrentUser().catch((error) => {
        console.warn('useAuthInit - Failed to get current user:', error);
      });
    }
  }, []); // Executa apenas uma vez na montagem do componente
};
