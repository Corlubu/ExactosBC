import { Client } from "minio";
import { env } from "./env";
import { getBaseUrl } from "./utils/base-url";

export const minioBaseUrl = getBaseUrl({ port: 9000 });

// Extraemos el dominio y el puerto limpiamente usando la API nativa de URL
const parsedUrl = new URL(minioBaseUrl);

export const minioClient = new Client({
  endPoint:
    process.env.NODE_ENV === "development" ? "minio" : parsedUrl.hostname,

  port: parseInt(parsedUrl.port) || 9000,
  useSSL: parsedUrl.protocol === "https:",
  accessKey: "admin",
  secretKey: env.ADMIN_PASSWORD,
});
