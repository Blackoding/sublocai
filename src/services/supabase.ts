import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/config/supabase'

// Usar configuração hardcoded para garantir funcionamento
const supabaseUrl = SUPABASE_CONFIG.url
const supabaseAnonKey = SUPABASE_CONFIG.anonKey
const supabaseServiceRoleKey = SUPABASE_CONFIG.serviceRoleKey

let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null
let supabaseAuthInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    // Validar se as chaves estão presentes
    if (!supabaseUrl) {
      throw new Error('supabaseUrl is required');
    }
    if (!supabaseServiceRoleKey) {
      throw new Error('supabaseServiceRoleKey is required');
    }
    
    console.log('Criando cliente Supabase com service role key...')
    console.log('URL:', supabaseUrl)
    console.log('Service Role Key (primeiros 20 chars):', supabaseServiceRoleKey.substring(0, 20) + '...')
    
    // Usar service role key para acesso administrativo completo (bypassa RLS)
    supabaseInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'Authorization': `Bearer ${supabaseServiceRoleKey}`
        }
      }
    })
  }
  return supabaseInstance
}

export const supabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdminInstance) {
    // Validar se as chaves estão presentes
    if (!supabaseUrl) {
      throw new Error('supabaseUrl is required');
    }
    if (!supabaseServiceRoleKey) {
      throw new Error('supabaseServiceRoleKey is required');
    }
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey)
  }
  return supabaseAdminInstance
}

// Cliente Supabase para autenticação (usa anon key)
export const getSupabaseAuthClient = (): SupabaseClient => {
  if (!supabaseAuthInstance) {
    // Validar se as chaves estão presentes
    if (!supabaseUrl) {
      throw new Error('supabaseUrl is required');
    }
    if (!supabaseAnonKey) {
      throw new Error('supabaseAnonKey is required');
    }
    
    console.log('Criando cliente Supabase para autenticação...')
    console.log('URL:', supabaseUrl)
    console.log('Anon Key (primeiros 20 chars):', supabaseAnonKey.substring(0, 20) + '...')
    
    // Usar anon key para autenticação normal
    supabaseAuthInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
  }
  return supabaseAuthInstance
}