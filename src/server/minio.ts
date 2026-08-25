import { Client } from "minio";
import { env } from "./env";
import { getBaseUrl } from "./utils/base-url";

export const minioBaseUrl = getBaseUrl({ port: 9000 });

// Extraemos el dominio y el puerto limpiamente usando la API nativa de URL
const parsedUrl = new URL(minioBaseUrl);

export const minioClient = new Client({
  // SOLUCIÓN: Leer de la variable de entorno, si no existe usar parsedUrl.hostname
  endPoint: process.env.MINIO_ENDPOINT || parsedUrl.hostname,

  port: parseInt(parsedUrl.port) || 9000,
  useSSL: parsedUrl.protocol === "https:",

  // SOLUCIÓN: Es mejor leer también estas credenciales desde el .env
  accessKey: process.env.MINIO_ACCESS_KEY || "admin",
  secretKey: process.env.MINIO_SECRET_KEY || env.ADMIN_PASSWORD,
});
