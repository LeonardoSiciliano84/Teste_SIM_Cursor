import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.SUPABASE_URL) {
  throw new Error(
    "SUPABASE_URL deve estar definida. Verifique o arquivo .env"
  );
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY deve estar definida. Verifique o arquivo .env"
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL deve estar definida. Verifique o arquivo .env"
  );
}

// Cliente Supabase para operações administrativas (backend)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Conexão direta com PostgreSQL para Drizzle ORM
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });

// Função para inicializar conexão e verificar saúde do banco
export async function initializeDatabase() {
  try {
    // Testar conexão com Supabase
    const { data: supabaseHealth } = await supabaseAdmin
      .from('_health_check')
      .select('*')
      .limit(1);
    
    console.log('✅ Supabase conectado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
    
    // Tentar conexão direta com PostgreSQL
    try {
      await client`SELECT 1 as health_check`;
      console.log('✅ PostgreSQL conectado via conexão direta');
      return true;
    } catch (pgError) {
      console.error('❌ Erro ao conectar com PostgreSQL:', pgError);
      throw new Error('Falha ao conectar com o banco de dados');
    }
  }
}

// Função para obter cliente Supabase público (para frontend)
export function getSupabasePublicConfig() {
  return {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  };
}