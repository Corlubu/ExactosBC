import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";
import QRCode from "qrcode";
import { minioClient, minioBaseUrl } from "~/server/minio";

const bulkAssetInputSchema = z.object({
  assetTag: z.string().min(1, "Asset tag is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z
    .enum(["ACTIVE", "IN_REPAIR", "DISPOSED", "STOLEN", "LOST"])
    .default("ACTIVE"),

  classCode: z.string().optional(),
  costCenterCode: z.string().optional(),
  areaCode: z.string().optional(),
  subareaCode: z.string().optional(),
  branchCode: z.string().optional(),
  serialNumber: z.string().optional(),
  supplierSerialNumber: z.string().optional(),

  branchId: z.number().optional(),
  departmentId: z.number().optional(),
  assetTypeId: z.number().optional(),

  seriesNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),

  // Components array updated for the new schema
  components: z
    .array(
      z.object({
        name: z.string(),
        cost: z.number().min(0),
        usefulLifeYears: z.number().optional(),
      }),
    )
    .optional(),

  supplier: z.string().optional(),
  purchaseDocument: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  quantity: z.number().int().min(1).default(1),
  currency: z.string().default("USD"),

  acquisitionCost: z.number().min(0, "Must be non-negative"),
  currentValue: z.number().min(0, "Must be non-negative"),
  residualValue: z.number().min(0).default(0),
  acquisitionDate: z.string().transform((str) => new Date(str)),
  serviceDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),

  depreciationMethod: z
    .enum([
      "STRAIGHT_LINE",
      "DECLINING_BALANCE",
      "UNITS_OF_PRODUCTION",
      "SUM_OF_YEARS_DIGITS",
    ])
    .default("STRAIGHT_LINE"),
  usefulLifeYears: z.number().int().min(1).optional(),
  convention: z
    .enum(["HALF_YEAR", "FULL_YEAR", "MID_MONTH"])
    .default("HALF_YEAR"),
  depreciationPercentage: z.number().min(0).max(100).optional(),
  depreciationStartDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),

  accountingAssetAccount: z.string().optional(),
  accumulatedDepreciationAccount: z.string().optional(),
  depreciationExpenseAccount: z.string().optional(),
  fixedAssetLedger: z.string().optional(),

  manufacturer: z.string().optional(),
  model: z.string().optional(),
  locationId: z.number().optional(),

  activityProject: z.string().optional(),
  observations: z.string().optional(),

  assignedToUserId: z.number().optional(),
});

// Función auxiliar para procesar QRs en segundo plano sin bloquear el hilo principal
async function processQRCodesInBackground(
  assetsToProcess: Array<{ id: number; assetTag: string }>,
) {
  for (const asset of assetsToProcess) {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(asset.assetTag, {
        errorCorrectionLevel: "H",
        type: "png",
        width: 300,
        margin: 2,
      });
      const timestamp = Date.now();
      const objectName = `public/qrcode/${timestamp}-${asset.assetTag}.png`;

      await minioClient.putObject(
        "asset-photos",
        objectName,
        qrCodeBuffer,
        qrCodeBuffer.length,
        {
          "Content-Type": "image/png",
        },
      );

      const qrCodeUrl = `${minioBaseUrl}/asset-photos/${objectName}`;
      await db.asset.update({ where: { id: asset.id }, data: { qrCodeUrl } });
    } catch (error) {
      console.error(
        `Background QR generation failed for asset ${asset.assetTag}:`,
        error,
      );
    }
  }
}

export const bulkImportAssets = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      assets: z
        .array(bulkAssetInputSchema)
        .min(1, "At least one asset is required"),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "assets.create");

    const results = {
      totalProcessed: input.assets.length,
      successCount: 0,
      failureCount: 0,
      errors: [] as Array<{ row: number; assetTag: string; error: string }>,
      createdAssetIds: [] as number[],
    };

    const assetTagsInInput = input.assets.map((a) => a.assetTag);
    const duplicatesInInput = assetTagsInInput.filter(
      (tag, index) => assetTagsInInput.indexOf(tag) !== index,
    );
    if (duplicatesInInput.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Duplicate asset tags found in import file: ${duplicatesInInput.join(", ")}`,
      });
    }

    const existingAssets = await db.asset.findMany({
      where: {
        assetTag: { in: assetTagsInInput },
        companyId: auth.companyId,
      },
      select: { assetTag: true },
    });

    if (existingAssets.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `The following asset tags already exist: ${existingAssets.map((a) => a.assetTag).join(", ")}`,
      });
    }

    const assetsForQrProcessing: Array<{ id: number; assetTag: string }> = [];

    // Procesamos de manera transaccional y rápida la BD
    for (let i = 0; i < input.assets.length; i++) {
      const assetData = input.assets[i];

      try {
        await db.$transaction(async (tx) => {
          const asset = await tx.asset.create({
            data: {
              companyId: auth.companyId,
              enteredById: auth.user.id,
              assetTag: assetData.assetTag,
              name: assetData.name,
              description: assetData.description,
              category: assetData.category,
              status: assetData.status,
              classCode: assetData.classCode,
              costCenterCode: assetData.costCenterCode,
              areaCode: assetData.areaCode,
              subareaCode: assetData.subareaCode,
              branchCode: assetData.branchCode,
              serialNumber: assetData.serialNumber,
              supplierSerialNumber: assetData.supplierSerialNumber,
              branchId: assetData.branchId,
              departmentId: assetData.departmentId,
              assetTypeId: assetData.assetTypeId,
              seriesNumber: assetData.seriesNumber,
              invoiceNumber: assetData.invoiceNumber,
              supplier: assetData.supplier,
              purchaseDocument: assetData.purchaseDocument,
              unitCost: assetData.unitCost,
              quantity: assetData.quantity,
              currency: assetData.currency,
              acquisitionCost: assetData.acquisitionCost,
              currentValue: assetData.currentValue,
              residualValue: assetData.residualValue,
              acquisitionDate: assetData.acquisitionDate,
              serviceDate: assetData.serviceDate,
              depreciationMethod: assetData.depreciationMethod,
              usefulLifeYears: assetData.usefulLifeYears,
              convention: assetData.convention,
              depreciationPercentage: assetData.depreciationPercentage,
              depreciationStartDate: assetData.depreciationStartDate,
              accountingAssetAccount: assetData.accountingAssetAccount,
              accumulatedDepreciationAccount:
                assetData.accumulatedDepreciationAccount,
              depreciationExpenseAccount: assetData.depreciationExpenseAccount,
              fixedAssetLedger: assetData.fixedAssetLedger,
              manufacturer: assetData.manufacturer,
              model: assetData.model,
              locationId: assetData.locationId,
              activityProject: assetData.activityProject,
              observations: assetData.observations,
              assignedToUserId: assetData.assignedToUserId,

              // Components Creation
              components:
                assetData.components && assetData.components.length > 0
                  ? {
                      create: assetData.components.map((comp) => ({
                        name: comp.name,
                        cost: comp.cost,
                        usefulLifeYears: comp.usefulLifeYears,
                      })),
                    }
                  : undefined,
            },
          });

          if (assetData.assignedToUserId) {
            await tx.assetAssignment.create({
              data: {
                assetId: asset.id,
                userId: assetData.assignedToUserId,
                startDate: new Date(),
                notes: "Initial assignment during bulk import",
                fixedAssetCode: assetData.assetTag,
              },
            });
          }

          results.successCount++;
          results.createdAssetIds.push(asset.id);

          // Guardamos en un array para procesar QRs después sin bloquear
          assetsForQrProcessing.push({
            id: asset.id,
            assetTag: asset.assetTag,
          });
        });
      } catch (error) {
        results.failureCount++;
        results.errors.push({
          row: i + 1,
          assetTag: assetData.assetTag,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Disparamos la generación de QR en background de forma asíncrona.
    // No usamos await aquí intencionalmente para devolver la respuesta HTTP rápidamente.
    processQRCodesInBackground(assetsForQrProcessing).catch(console.error);

    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "BULK_IMPORT",
      entityType: "ASSET",
      entityId: 0,
      newValues: {
        totalProcessed: results.totalProcessed,
        successCount: results.successCount,
        failureCount: results.failureCount,
      },
    });

    return results;
  });
