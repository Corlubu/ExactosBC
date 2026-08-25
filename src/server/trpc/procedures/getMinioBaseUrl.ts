import { protectedProcedure } from "~/server/trpc/main";
import { minioBaseUrl } from "~/server/minio";

export const getMinioBaseUrl = protectedProcedure.query(() => {
  return { minioBaseUrl };
});
