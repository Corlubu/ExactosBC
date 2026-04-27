import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient, minioBaseUrl } from "~/server/minio";
import QRCode from "qrcode";

export const generateLocationBarcode = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      locationId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Fetch the location to ensure it exists and belongs to the user's company
    const location = await db.location.findFirst({
      where: {
        id: input.locationId,
        companyId: auth.companyId,
      },
    });

    if (!location) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Location not found",
      });
    }

    // Use location ID for the barcode
    const barcodeData = `LOC-${location.id}`;

    // Generate QR code as a buffer (PNG image)
    const qrCodeBuffer = await QRCode.toBuffer(barcodeData, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
      margin: 2,
    });

    // Generate unique object name for the QR code
    const timestamp = Date.now();
    const objectName = `public/qrcode/location/${timestamp}-${location.id}.png`;

    // Upload to MinIO
    await minioClient.putObject(
      "asset-photos",
      objectName,
      qrCodeBuffer,
      qrCodeBuffer.length,
      {
        "Content-Type": "image/png",
      }
    );

    // Construct the public URL
    const qrCodeUrl = `${minioBaseUrl}/asset-photos/${objectName}`;

    // Update the location with the QR code URL
    await db.location.update({
      where: {
        id: location.id,
      },
      data: {
        qrCodeUrl,
      },
    });

    return {
      qrCodeUrl,
    };
  });
