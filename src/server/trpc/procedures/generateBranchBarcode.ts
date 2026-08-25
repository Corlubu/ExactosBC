import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient, minioBaseUrl } from "~/server/minio";
import QRCode from "qrcode";

export const generateBranchBarcode = protectedProcedure
  .input(
    z.object({
      branchId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Fetch the branch to ensure it exists and belongs to the user's company
    const branch = await db.branch.findFirst({
      where: {
        id: input.branchId,
        companyId: ctx.companyId,
      },
    });

    if (!branch) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Branch not found",
      });
    }

    // Use branch code for the barcode
    const barcodeData = `BRANCH-${branch.code}`;

    // Generate QR code as a buffer (PNG image)
    const qrCodeBuffer = await QRCode.toBuffer(barcodeData, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
      margin: 2,
    });

    // Generate unique object name for the QR code
    const timestamp = Date.now();
    const objectName = `public/qrcode/branch/${timestamp}-${branch.id}.png`;

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

    // Update the branch with the QR code URL
    await db.branch.update({
      where: {
        id: branch.id,
      },
      data: {
        qrCodeUrl,
      },
    });

    return {
      qrCodeUrl,
    };
  });
