import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, SignUpData, SignInData, ProfileUpdateData } from '@/types';
import { authUtils } from '@/services/authService';
import { getSupabaseAuthClient } from '@/services/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  signUp: (data: SignUpData) => Promise<boolean>;
  signIn: (data: SignInData) => Promise<boolean>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (updates: ProfileUpdateData) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      signUp: async (data: SignUpData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, error } = await authUtils.signUp(data);
          
          if (error) {
            set({ error, isLoading: false });
            return false;
          }

          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      signIn: async (data: SignInData) => {
        console.log('AuthStore - signIn iniciado com:', data.email);
        set({ isLoading: true, error: null });
        
        try {
          const { user, error } = await authUtils.signIn(data);
          
          if (error) {
            console.log('AuthStore - signIn erro:', error);
            set({ error, isLoading: false });
            return false;
          }

          console.log('AuthStore - signIn sucesso:', user?.fullName);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          console.log('AuthStore - signIn exceção:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        console.log('AuthStore - signOut iniciado');
        set({ isLoading: true });
        
        try {
          // Tentar logout com authUtils primeiro
          console.log('AuthStore - Tentando logout com authUtils...');
          const result = await Promise.race([
            authUtils.signOut(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout no authUtils.signOut')), 5000)
            )
          ]);
          
          console.log('AuthStore - authUtils.signOut resultado:', result);
        } catch (error) {
          console.log('AuthStore - authUtils.signOut falhou ou timeout:', error);
          // Continuar com logout local mesmo se authUtils falhar
        }
        
        // Limpar localStorage e estado local
        if (typeof window !== 'undefined') {
          // O Supabase gerencia automaticamente o localStorage
          console.log('AuthStore - Estado limpo');
        }
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          error: null 
        });
        console.log('AuthStore - signOut store atualizado');
      },

      getCurrentUser: async () => {
        // Só executa no cliente
        if (typeof window === 'undefined') {
          return;
        }

        console.log('AuthStore - getCurrentUser iniciado');
        set({ isLoading: true });
        
        try {
          // Adicionar timeout para evitar travamento
          const userPromise = authUtils.getCurrentUser();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout no getCurrentUser')), 10000)
          );
          
          const { user, error } = await Promise.race([userPromise, timeoutPromise]) as { user: unknown, error: unknown };
          
          if (error || !user) {
            console.log('AuthStore - getCurrentUser sem usuário:', error);
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: null 
            });
            return;
          }

          console.log('AuthStore - getCurrentUser sucesso:', (user as { fullName?: string }).fullName);
          set({ 
            user: user as User, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });
        } catch (error) {
          console.warn('AuthStore - Error getting current user:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
        }
      },

      updateProfile: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) {
          set({ error: 'Usuário não encontrado' });
          return false;
        }

        set({ isLoading: true, error: null });
        
        try {
          const { user, error } = await authUtils.updateProfile(currentUser.id, updates);
          
          if (error) {
            set({ error, isLoading: false });
            return false;
          }

          set({ 
            user, 
            isLoading: false, 
            error: null 
          });
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // nome único para o localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // só persiste user e isAuthenticated, não isLoading e error
    }
  )
);

// Listener para mudanças de autenticação
if (typeof window !== 'undefined') {
  const supabase = getSupabaseAuthClient();
  
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // O getCurrentUser será chamado pelo useAuthInit
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.getState().signOut();
    } else if (event === 'TOKEN_REFRESHED' && session) {
      // Token foi renovado, mas o usuário ainda está logado
    }
  });
}
