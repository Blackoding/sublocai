import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuthInit = () => {
  const { getCurrentUser, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Só tenta carregar o usuário se estivermos no cliente
    if (typeof window !== 'undefined') {
      // Se já temos um usuário persistido, não precisa buscar novamente
      if (user && isAuthenticated) {
        console.log('useAuthInit - Usuário já persistido:', user.fullName);
        return;
      }

      console.log('useAuthInit - Buscando usuário...');
      getCurrentUser().catch((error) => {
        console.warn('Failed to get current user:', error);
      });
    }
  }, [user, isAuthenticated]); // Removido getCurrentUser das dependências
};
