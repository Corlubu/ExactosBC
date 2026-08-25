import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient, minioBaseUrl } from "~/server/minio";
import QRCode from "qrcode";

export const generateCustodianBarcode = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const auth = await requirePermission(input.authToken, "admin.users");

    // Fetch the user to ensure it exists and belongs to the user's company
    const user = await db.user.findFirst({
      where: {
        id: input.userId,
        companyId: ctx.companyId,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Use identification number if available, otherwise use user ID
    const barcodeData = user.identificationNumber || `USER-${user.id}`;

    // Generate QR code as a buffer (PNG image)
    const qrCodeBuffer = await QRCode.toBuffer(barcodeData, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
      margin: 2,
    });

    // Generate unique object name for the QR code
    const timestamp = Date.now();
    const objectName = `public/qrcode/custodian/${timestamp}-${user.id}.png`;

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

    // Update the user with the QR code URL
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        qrCodeUrl,
      },
    });

    return {
      qrCodeUrl,
    };
  });
