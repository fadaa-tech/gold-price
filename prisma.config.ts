import { defineConfig } from "prisma/config";
import { config as loadEnv } from "dotenv";

// Prisma 7 CLI no longer auto-loads .env.local; Next.js still does at runtime.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
