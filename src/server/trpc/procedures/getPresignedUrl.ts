import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { minioClient, minioBaseUrl } from "~/server/minio";

export const getPresignedUrl = protectedProcedure
  .input(
    z.object({
      fileName: z.string(),
      fileType: z.enum([
        "PHOTO",
        "INVOICE",
        "CONTRACT",
        "INSURANCE_POLICY",
        "WARRANTY",
        "LOGO",
        "OTHER",
      ]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Generate unique object name with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const objectName = `public/${input.fileType.toLowerCase()}/${timestamp}-${sanitizedFileName}`;

    // Generate presigned URL for uploading (valid for 15 minutes)
    const uploadUrl = await minioClient.presignedPutObject(
      "asset-photos",
      objectName,
      15 * 60, // 15 minutes
    );

    // Construct the public URL for accessing the file after upload
    const publicUrl = `${minioBaseUrl}/asset-photos/${objectName}`;

    return {
      uploadUrl,
      publicUrl,
      objectName,
    };
  });
