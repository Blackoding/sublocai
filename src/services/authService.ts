import { useCallback, useState } from 'react';
import type { AuthResponse, ProfileUpdateData, SignInData, SignUpData, User } from '@/types';
import { createAnonSupabaseClient } from '@/config/supabase';

type UsersTableRow = {
  id: string;
  email: string;
  user_type: 'professional' | 'company';
  phone: string;
  avatar?: string | null;
  full_name?: string | null;
  cpf?: string | null;
  birth_date?: string | null;
  specialty?: string | null;
  registration_code?: string | null;
  company_name?: string | null;
  trade_name?: string | null;
  cnpj?: string | null;
  responsible_name?: string | null;
  responsible_cpf?: string | null;
  plan_empresa?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UsersTableSelectUser = {
  user: User | null;
  error: string | null;
};

type SupabaseAuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isUserType = (value: unknown): User['userType'] | null => {
  if (value === 'professional' || value === 'company') return value;
  return null;
};

const mapRowToUser = (row: UsersTableRow): User => ({
  id: row.id,
  email: row.email,
  userType: row.user_type,
  phone: row.phone,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
  avatar: row.avatar || undefined,
  fullName: row.full_name || undefined,
  cpf: row.cpf || undefined,
  birthDate: row.birth_date || undefined,
  specialty: row.specialty || undefined,
  registrationCode: row.registration_code || undefined,
  companyName: row.company_name || undefined,
  tradeName: row.trade_name || undefined,
  cnpj: row.cnpj || undefined,
  responsibleName: row.responsible_name || undefined,
  responsibleCpf: row.responsible_cpf || undefined,
  planEmpresa: parsePlanEmpresa(row.plan_empresa || undefined)
});

const safeMetadataString = (metadata: Record<string, unknown>, key: string): string | undefined => {
  const value = metadata[key];
  return isNonEmptyString(value) ? value : undefined;
};

const parsePlanEmpresa = (value: string | undefined): User['planEmpresa'] | undefined => {
  if (!value) return undefined;
  if (value === 'free' || value === 'basic' || value === 'pro') return value;
  return undefined;
};

const mapAuthUserToUserFromMetadata = (authUser: SupabaseAuthUserLike): User | null => {
  const metadata = authUser.user_metadata || {};
  const userType = isUserType(metadata.userType);
  const phone = safeMetadataString(metadata, 'phone');
  const email = authUser.email || '';

  if (!userType || !phone || !isNonEmptyString(email)) return null;

  const createdAt = isNonEmptyString(authUser.created_at) ? authUser.created_at : new Date().toISOString();
  const updatedAt = isNonEmptyString(authUser.updated_at) ? authUser.updated_at : new Date().toISOString();

  const avatar = safeMetadataString(metadata, 'avatar');

  const fullName = safeMetadataString(metadata, 'fullName');
  const cpf = safeMetadataString(metadata, 'cpf');
  const birthDate = safeMetadataString(metadata, 'birthDate');
  const specialty = safeMetadataString(metadata, 'specialty');
  const registrationCode = safeMetadataString(metadata, 'registrationCode');

  const companyName = safeMetadataString(metadata, 'companyName');
  const tradeName = safeMetadataString(metadata, 'tradeName');
  const cnpj = safeMetadataString(metadata, 'cnpj');
  const responsibleName = safeMetadataString(metadata, 'responsibleName');
  const responsibleCpf = safeMetadataString(metadata, 'responsibleCpf');
  const planEmpresa = parsePlanEmpresa(safeMetadataString(metadata, 'planEmpresa'));

  return {
    id: authUser.id,
    email,
    userType,
    phone,
    createdAt,
    updatedAt,
    avatar,
    fullName,
    cpf,
    birthDate,
    specialty,
    registrationCode,
    companyName,
    tradeName,
    cnpj,
    responsibleName,
    responsibleCpf,
    planEmpresa
  };
};

const fetchUsersTableUser = async (supabase: ReturnType<typeof createAnonSupabaseClient>, userId: string): Promise<UsersTableSelectUser> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return { user: null, error: error?.message || null };
    const row = data as unknown as UsersTableRow;
    return { user: mapRowToUser(row), error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { user: null, error: errorMessage };
  }
};

type SignUpApiResponse = {
  user?: User;
  error?: string;
};

export const authUtils = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch('/api/auth-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const json = (await response.json()) as SignUpApiResponse;
    if (!response.ok || json.error) {
      return { user: null, error: json.error || 'Erro ao criar conta' };
    }

    return { user: json.user || null, error: null };
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const supabase = createAnonSupabaseClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(data);

      if (signInError || !signInData.user) {
        return { user: null, error: signInError?.message || 'Failed to sign in' };
      }

      const authUser = signInData.user as SupabaseAuthUserLike;
      const usersTableUser = await fetchUsersTableUser(supabase, authUser.id);
      if (usersTableUser.user) return { user: usersTableUser.user, error: null };

      const metadataUser = mapAuthUserToUserFromMetadata(authUser);
      if (metadataUser) return { user: metadataUser, error: null };

      return { user: null, error: usersTableUser.error || 'User profile not found' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected sign in error';
      return { user: null, error: errorMessage };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      const supabase = createAnonSupabaseClient();
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected sign out error';
      return { error: errorMessage };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const supabase = createAnonSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        return { user: null, error: null };
      }

      if (!authData.user) {
        return { user: null, error: null };
      }

      const authUser = authData.user as SupabaseAuthUserLike;
      const usersTableUser = await fetchUsersTableUser(supabase, authUser.id);
      if (usersTableUser.user) return { user: usersTableUser.user, error: null };

      const metadataUser = mapAuthUserToUserFromMetadata(authUser);
      if (metadataUser) return { user: metadataUser, error: null };

      return { user: null, error: usersTableUser.error || 'User profile not found' };
    } catch {
      return { user: null, error: null };
    }
  },

  async updateProfile(userId: string, updates: ProfileUpdateData): Promise<AuthResponse> {
    try {
      const supabase = createAnonSupabaseClient();

      const tableUpdates: Record<string, unknown> = {
        phone: updates.phone
      };

      if (typeof updates.avatar === 'string') tableUpdates.avatar = updates.avatar;
      if (typeof updates.fullName === 'string') tableUpdates.full_name = updates.fullName;
      if (typeof updates.cpf === 'string') tableUpdates.cpf = updates.cpf;
      if (typeof updates.birthDate === 'string') tableUpdates.birth_date = updates.birthDate;
      if (typeof updates.specialty === 'string') tableUpdates.specialty = updates.specialty;
      if (typeof updates.registrationCode === 'string') tableUpdates.registration_code = updates.registrationCode;

      if (typeof updates.companyName === 'string') tableUpdates.company_name = updates.companyName;
      if (typeof updates.tradeName === 'string') tableUpdates.trade_name = updates.tradeName;
      if (typeof updates.cnpj === 'string') tableUpdates.cnpj = updates.cnpj;
      if (typeof updates.responsibleName === 'string') tableUpdates.responsible_name = updates.responsibleName;
      if (typeof updates.responsibleCpf === 'string') tableUpdates.responsible_cpf = updates.responsibleCpf;

      const { data: updatedRow, error: tableUpdateError } = await supabase
        .from('users')
        .update(tableUpdates)
        .eq('id', userId)
        .select('*')
        .single();

      if (!tableUpdateError && updatedRow) {
        const row = updatedRow as unknown as UsersTableRow;
        return { user: mapRowToUser(row), error: null };
      }

      const metadataUpdates: Record<string, unknown> = {
        phone: updates.phone
      };

      if (typeof updates.avatar === 'string') metadataUpdates.avatar = updates.avatar;
      if (typeof updates.fullName === 'string') metadataUpdates.fullName = updates.fullName;
      if (typeof updates.cpf === 'string') metadataUpdates.cpf = updates.cpf;
      if (typeof updates.birthDate === 'string') metadataUpdates.birthDate = updates.birthDate;
      if (typeof updates.specialty === 'string') metadataUpdates.specialty = updates.specialty;
      if (typeof updates.registrationCode === 'string') metadataUpdates.registrationCode = updates.registrationCode;

      if (typeof updates.companyName === 'string') metadataUpdates.companyName = updates.companyName;
      if (typeof updates.tradeName === 'string') metadataUpdates.tradeName = updates.tradeName;
      if (typeof updates.cnpj === 'string') metadataUpdates.cnpj = updates.cnpj;
      if (typeof updates.responsibleName === 'string') metadataUpdates.responsibleName = updates.responsibleName;
      if (typeof updates.responsibleCpf === 'string') metadataUpdates.responsibleCpf = updates.responsibleCpf;

      const { data: authUpdateData, error: authUpdateError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });

      if (authUpdateError || !authUpdateData.user) {
        return { user: null, error: authUpdateError?.message || tableUpdateError?.message || 'Failed to update profile' };
      }

      const authUser = authUpdateData.user as SupabaseAuthUserLike;
      const metadataUser = mapAuthUserToUserFromMetadata(authUser);
      if (!metadataUser) {
        return { user: null, error: 'Updated user profile is missing required fields' };
      }

      return { user: metadataUser, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected update profile error';
      return { user: null, error: errorMessage };
    }
  }
};

export const useAuthService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async (data: SignUpData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.signUp(data);
      setError(result.error);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (data: SignInData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.signIn(data);
      setError(result.error);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<{ error: string | null }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.signOut();
      setError(result.error);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async (): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.getCurrentUser();
      setError(result.error);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updates: ProfileUpdateData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authUtils.updateProfile(userId, updates);
      setError(result.error);
      return result;
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

