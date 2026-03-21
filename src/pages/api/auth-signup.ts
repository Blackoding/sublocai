import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceRoleSupabaseClient } from '@/config/supabase';
import type { SignUpData, User } from '@/types';

type ApiResponse = {
  user?: User;
  error?: string;
};

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
  plan_empresa?: 'free' | 'basic' | 'pro' | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const isUserType = (value: unknown): SignUpData['userType'] | null => {
  if (value === 'professional' || value === 'company') return value;
  return null;
};

const parsePlanEmpresa = (value: unknown): User['planEmpresa'] | undefined => {
  if (value === 'free' || value === 'basic' || value === 'pro') return value;
  return undefined;
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
  planEmpresa: row.plan_empresa || undefined
});

const mapMetadataToUser = (userId: string, email: string, metadata: Record<string, unknown>): User | null => {
  const userType = isUserType(metadata.userType);
  const phone = isNonEmptyString(metadata.phone) ? metadata.phone : null;
  if (!userType || !phone) return null;

  const createdAt = isNonEmptyString(metadata.created_at) ? metadata.created_at : new Date().toISOString();
  const updatedAt = isNonEmptyString(metadata.updated_at) ? metadata.updated_at : new Date().toISOString();

  const fullName = isNonEmptyString(metadata.fullName) ? metadata.fullName : undefined;
  const cpf = isNonEmptyString(metadata.cpf) ? metadata.cpf : undefined;
  const birthDate = isNonEmptyString(metadata.birthDate) ? metadata.birthDate : undefined;
  const specialty = isNonEmptyString(metadata.specialty) ? metadata.specialty : undefined;
  const registrationCode = isNonEmptyString(metadata.registrationCode) ? metadata.registrationCode : undefined;

  const companyName = isNonEmptyString(metadata.companyName) ? metadata.companyName : undefined;
  const tradeName = isNonEmptyString(metadata.tradeName) ? metadata.tradeName : undefined;
  const cnpj = isNonEmptyString(metadata.cnpj) ? metadata.cnpj : undefined;
  const responsibleName = isNonEmptyString(metadata.responsibleName) ? metadata.responsibleName : undefined;
  const responsibleCpf = isNonEmptyString(metadata.responsibleCpf) ? metadata.responsibleCpf : undefined;
  const planEmpresa = parsePlanEmpresa(metadata.planEmpresa);

  return {
    id: userId,
    email,
    userType,
    phone,
    createdAt,
    updatedAt,
    avatar: isNonEmptyString(metadata.avatar) ? metadata.avatar : undefined,
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

type AdminListUsersUser = {
  id: string;
  email?: string | null;
};

const findAuthUserIdByEmail = async (
  supabase: {
    auth: {
      admin: {
        listUsers: (params: { page: number; perPage: number }) => Promise<{
          data: { users: AdminListUsersUser[] } | null;
          error: unknown;
        }>;
      };
    };
  },
  email: string
): Promise<string | null> => {
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return null;

    const users = data?.users ?? [];
    const match = users.find(u => (u.email || '').trim().toLowerCase() === normalizedEmail);
    if (match) return match.id;

    if (users.length < 100) break;
  }

  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const body = req.body as Partial<SignUpData>;

    if (!isNonEmptyString(body.email) || !isNonEmptyString(body.password) || !isNonEmptyString(body.phone)) {
      res.status(400).json({ error: 'Dados de cadastro inválidos' });
      return;
    }

    const userType = isUserType(body.userType);
    if (!userType) {
      res.status(400).json({ error: 'Tipo de conta inválido' });
      return;
    }

    const metadata: Record<string, unknown> = {
      userType,
      phone: body.phone
    };

    if (userType === 'professional') {
      if (
        !isNonEmptyString(body.fullName) ||
        !isNonEmptyString(body.cpf) ||
        !isNonEmptyString(body.birthDate) ||
        !isNonEmptyString(body.specialty)
      ) {
        res.status(400).json({ error: 'Campos do profissional obrigatórios estão faltando' });
        return;
      }

      metadata.fullName = body.fullName;
      metadata.cpf = body.cpf;
      metadata.birthDate = body.birthDate;
      metadata.specialty = body.specialty;
      if (body.registrationCode) metadata.registrationCode = body.registrationCode;
    } else {
      if (
        !isNonEmptyString(body.companyName) ||
        !isNonEmptyString(body.tradeName) ||
        !isNonEmptyString(body.cnpj) ||
        !isNonEmptyString(body.responsibleName) ||
        !isNonEmptyString(body.responsibleCpf)
      ) {
        res.status(400).json({ error: 'Campos da empresa obrigatórios estão faltando' });
        return;
      }

      metadata.companyName = body.companyName;
      metadata.tradeName = body.tradeName;
      metadata.cnpj = body.cnpj;
      metadata.responsibleName = body.responsibleName;
      metadata.responsibleCpf = body.responsibleCpf;
      if (body.planEmpresa) metadata.planEmpresa = body.planEmpresa;
    }

    const serviceClientForAuth = createServiceRoleSupabaseClient();
    const targetEmail = body.email.trim().toLowerCase();

    let userId: string | null = null;

    try {
      const { data: createdUser, error: createUserError } =
        await serviceClientForAuth.auth.admin.createUser({
          email: body.email,
          password: body.password,
          user_metadata: metadata,
          email_confirm: true,
          phone_confirm: true
        });

      const createdId = (createdUser as { user?: { id?: string } } | null)?.user?.id;
      if (createUserError || !createdId) throw createUserError || new Error('Failed to create user');

      userId = createdId;
    } catch {
      userId = await findAuthUserIdByEmail(serviceClientForAuth, targetEmail);

      if (!userId) {
        res.status(400).json({ error: 'Erro ao criar conta de autenticação' });
        return;
      }

      await serviceClientForAuth.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
        password: body.password,
        email_confirm: true,
        phone_confirm: true
      });
    }

    if (!userId) {
      res.status(400).json({ error: 'Erro ao criar conta de autenticação' });
      return;
    }

    const serviceClient = serviceClientForAuth;
    const usersTableRecord: Record<string, unknown> = {
      id: userId,
      email: body.email,
      user_type: userType,
      phone: body.phone
    };

    if (userType === 'professional') {
      usersTableRecord.full_name = body.fullName;
      usersTableRecord.cpf = body.cpf;
      usersTableRecord.birth_date = body.birthDate;
      usersTableRecord.specialty = body.specialty;
      usersTableRecord.registration_code = body.registrationCode || null;
    } else {
      usersTableRecord.company_name = body.companyName;
      usersTableRecord.trade_name = body.tradeName;
      usersTableRecord.cnpj = body.cnpj;
      usersTableRecord.responsible_name = body.responsibleName;
      usersTableRecord.responsible_cpf = body.responsibleCpf;
      usersTableRecord.plan_empresa = body.planEmpresa || 'free';
    }

    let insertedUser: User | null = null;
    try {
      const { data: upsertedRow } = await serviceClient
        .from('users')
        .upsert(usersTableRecord, { onConflict: 'id' })
        .select()
        .single();

      if (upsertedRow) insertedUser = mapRowToUser(upsertedRow as UsersTableRow);
    } catch {
      insertedUser = null;
    }

    const userFromMetadata = mapMetadataToUser(userId, body.email, metadata);
    const user = insertedUser || userFromMetadata || null;

    if (!user) {
      res.status(201).json({ error: 'Usuário criado, mas não foi possível concluir o cadastro' });
      return;
    }

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro inesperado durante o cadastro'
    });
  }
}

