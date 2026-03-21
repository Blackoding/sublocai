import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getRequiredValue = (value: string | undefined, name: string): string => {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

export const createAnonSupabaseClient = () => {
  const url = getRequiredValue(NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getRequiredValue(NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anonKey);
};

export const createServiceRoleSupabaseClient = () => {
  const url = getRequiredValue(NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getRequiredValue(SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey);
};

