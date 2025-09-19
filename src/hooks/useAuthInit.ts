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

      // Verificar se há token no localStorage antes de buscar
      const token = localStorage.getItem('sb-nmxcqiwslkuvdydlsolm-auth-token');
      if (!token) {
        console.log('useAuthInit - Nenhum token encontrado');
        return;
      }

      console.log('useAuthInit - Buscando usuário...');
      getCurrentUser().catch((error) => {
        console.warn('Failed to get current user:', error);
      });

      // Listener para mudanças no localStorage
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sb-nmxcqiwslkuvdydlsolm-auth-token') {
          getCurrentUser().catch((error) => {
            console.warn('Failed to get current user after storage change:', error);
          });
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [getCurrentUser, user, isAuthenticated]);
};
