import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient, minioBaseUrl } from "~/server/minio";
import QRCode from "qrcode";

export const generateDepartmentBarcode = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      departmentId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Fetch the department to ensure it exists and belongs to the user's company
    const department = await db.department.findFirst({
      where: {
        id: input.departmentId,
        companyId: auth.companyId,
      },
      include: {
        branch: true,
      },
    });

    if (!department) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Department not found",
      });
    }

    // Use branch code + department code for the barcode
    const barcodeData = `DEPT-${department.branch.code}-${department.code}`;

    // Generate QR code as a buffer (PNG image)
    const qrCodeBuffer = await QRCode.toBuffer(barcodeData, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
      margin: 2,
    });

    // Generate unique object name for the QR code
    const timestamp = Date.now();
    const objectName = `public/qrcode/department/${timestamp}-${department.id}.png`;

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

    // Update the department with the QR code URL
    await db.department.update({
      where: {
        id: department.id,
      },
      data: {
        qrCodeUrl,
      },
    });

    return {
      qrCodeUrl,
    };
  });
