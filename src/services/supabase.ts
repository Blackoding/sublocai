import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Valores hardcoded diretamente no código
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const _supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTg3NTEsImV4cCI6MjA3Mzc3NDc1MX0.K8NfXbU_rTnCT86v8hzKryfeguL5MGV2s17L7OH4JGw'

// Service Role Key para acesso administrativo completo
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

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