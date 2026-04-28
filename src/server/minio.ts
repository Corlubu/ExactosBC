import { Client } from "minio";
import { env } from "./env";
import { getBaseUrl } from "./utils/base-url";

export const minioBaseUrl = getBaseUrl({ port: 9000 });

// Extraemos el dominio y el puerto limpiamente usando la API nativa de URL
const parsedUrl = new URL(minioBaseUrl);

export const minioClient = new Client({
  endPoint: parsedUrl.hostname, // Esto enviará "localhost" puro, sin el puerto
  port: parseInt(parsedUrl.port) || 9000, // Enviamos el puerto por separado
  useSSL: parsedUrl.protocol === "https:",
  // Asegúrate de que estas sean las credenciales reales de tu contenedor MinIO local
  accessKey: "admin",
  secretKey: env.ADMIN_PASSWORD,
});
