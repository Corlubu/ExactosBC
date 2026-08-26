import { z } from "zod";
import { config } from "dotenv";

// 1. Esto fuerza la carga del archivo .env a la memoria (process.env)
config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  // Puedes agregar el resto de variables que usamos (es opcional para Zod, pero bueno para mantener el orden)
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  // Almacenamiento S3-compatible (Supabase Storage)
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
