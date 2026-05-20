import { defineConfig } from "prisma/config";
import { config as loadEnv } from "dotenv";

// Prisma 7 CLI no longer auto-loads .env.local; Next.js still does at runtime.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Prefer the direct (non-pooled) URL for the schema engine. Neon's
    // pooler is PgBouncer in transaction mode and can't hold the session
    // advisory lock that `prisma migrate` acquires (P1002 timeout).
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
