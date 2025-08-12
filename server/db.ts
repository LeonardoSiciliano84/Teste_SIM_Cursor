import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Em desenvolvimento, usar SQLite se não houver DATABASE_URL
const isDevelopment = process.env.NODE_ENV === 'development';
const hasDatabaseUrl = process.env.DATABASE_URL;

if (!hasDatabaseUrl && !isDevelopment) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db: any;

if (hasDatabaseUrl) {
  // Configuração para Supabase/PostgreSQL
  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
    ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer'
  });
  db = drizzle(client, { schema });
} else {
  // Configuração para SQLite em desenvolvimento
  const sqlite = new Database('./dev.db');
  db = drizzleSQLite(sqlite, { schema });
}

export { db };
