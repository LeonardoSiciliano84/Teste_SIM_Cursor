import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão disponíveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('⚠️ VITE_SUPABASE_URL não configurada. Usando modo mock.');
}

if (!supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY não configurada. Usando modo mock.');
}

// Cliente Supabase para o frontend (usando chave pública/anônima)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Função para autenticação com email/senha
export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Função para registro de novo usuário
export async function signUp(email: string, password: string, metadata: any = {}) {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Função para logout
export async function signOut() {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }

  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

// Função para obter usuário atual
export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }

  return user;
}

// Função para escutar mudanças de autenticação
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  if (!supabase) {
    return () => {}; // Retorna função vazia se Supabase não configurado
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  
  return () => subscription.unsubscribe();
}

// Função para resetar senha
export async function resetPassword(email: string) {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    throw new Error(error.message);
  }
}

// Função para atualizar perfil do usuário
export async function updateUserProfile(updates: any) {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}