import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient, minioBaseUrl } from "~/server/minio";
import QRCode from "qrcode";

export const generateAssetBarcode = protectedProcedure
  .input(
    z.object({
      assetId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Fetch the asset to ensure it exists and belongs to the user's company
    const asset = await db.asset.findFirst({
      where: {
        id: input.assetId,
        companyId: ctx.companyId,
      },
    });

    if (!asset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Asset not found",
      });
    }

    // Generate QR code as a buffer (PNG image)
    const qrCodeBuffer = await QRCode.toBuffer(asset.assetTag, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
      margin: 2,
    });

    // Generate unique object name for the QR code
    const timestamp = Date.now();
    const objectName = `public/qrcode/${timestamp}-${asset.assetTag}.png`;

    // Upload to MinIO
    await minioClient.putObject(
      "asset-photos",
      objectName,
      qrCodeBuffer,
      qrCodeBuffer.length,
      {
        "Content-Type": "image/png",
      },
    );

    // Construct the public URL
    const qrCodeUrl = `${minioBaseUrl}/asset-photos/${objectName}`;

    // Update the asset with the QR code URL
    await db.asset.update({
      where: {
        id: asset.id,
      },
      data: {
        qrCodeUrl,
      },
    });

    return {
      qrCodeUrl,
    };
  });
