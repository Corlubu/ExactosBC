// Capa de almacenamiento de objetos, respaldada por la API S3-compatible de
// Supabase Storage (https://<project-ref>.supabase.co/storage/v1/s3).
//
// El SDK de "minio" no soporta endpoints con un path base (Supabase expone el
// endpoint S3 bajo "/storage/v1/s3", no en la raíz del host), así que se usa
// @aws-sdk/client-s3 en modo path-style. Se mantienen los nombres exportados
// (minioClient, minioBaseUrl) y la forma de los métodos usados en el resto
// del código para no tener que tocar cada llamador.
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";
import { getBaseUrl } from "./utils/base-url";

// Base pública para construir enlaces directos a objetos marcados como
// públicos (prefijo "public/"), p. ej. códigos QR y fotos de activos.
// Para Supabase esto es "https://<ref>.supabase.co/storage/v1/object/public".
// En desarrollo local (sin S3_PUBLIC_URL) se usa un MinIO local como fallback.
export const minioBaseUrl = env.S3_PUBLIC_URL ?? getBaseUrl({ port: 9000 });

const endpoint = env.S3_ENDPOINT ?? minioBaseUrl;
const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID ?? "admin",
    secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? env.ADMIN_PASSWORD,
  },
});

type ObjectMetadata = Record<string, string>;

export const minioClient = {
  async bucketExists(bucket: string): Promise<boolean> {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      return true;
    } catch {
      return false;
    }
  },

  async makeBucket(bucket: string, _region?: string): Promise<void> {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  },

  // Supabase Storage no expone el API clásico de "bucket policy" por S3.
  // La visibilidad pública de un bucket se controla desde el dashboard de
  // Supabase (Storage -> bucket -> Make public) o vía política RLS sobre
  // storage.objects. Este método se deja como no-op informativo para no
  // romper a los llamadores existentes.
  async setBucketPolicy(bucket: string, _policy: string): Promise<void> {
    console.warn(
      `[storage] setBucketPolicy ignorado para "${bucket}": marca el bucket como público desde Supabase Studio (Storage -> ${bucket} -> Make public).`,
    );
  },

  async putObject(
    bucket: string,
    objectName: string,
    body: PutObjectCommandInput["Body"],
    _size?: number,
    metadata?: ObjectMetadata,
  ): Promise<void> {
    const { "Content-Type": contentType, ...rest } = metadata ?? {};
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectName,
        Body: body,
        ContentType: contentType,
        Metadata: Object.keys(rest).length > 0 ? rest : undefined,
      }),
    );
  },

  async presignedGetObject(
    bucket: string,
    objectName: string,
    expirySeconds: number,
  ): Promise<string> {
    return getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: objectName }),
      { expiresIn: expirySeconds },
    );
  },

  async presignedPutObject(
    bucket: string,
    objectName: string,
    expirySeconds: number,
  ): Promise<string> {
    return getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: bucket, Key: objectName }),
      { expiresIn: expirySeconds },
    );
  },
};
