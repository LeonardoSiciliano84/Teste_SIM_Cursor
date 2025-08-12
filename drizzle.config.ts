import { defineConfig } from "drizzle-kit";

// Em desenvolvimento, usar SQLite se não houver DATABASE_URL
const isDevelopment = process.env.NODE_ENV === 'development';
const hasDatabaseUrl = process.env.DATABASE_URL;

if (!hasDatabaseUrl && !isDevelopment) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: hasDatabaseUrl ? "postgresql" : "sqlite",
  dbCredentials: hasDatabaseUrl ? {
    url: process.env.DATABASE_URL,
  } : {
    url: "./dev.db",
  },
});
