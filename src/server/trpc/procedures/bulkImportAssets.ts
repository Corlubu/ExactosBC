import { z } from "zod";
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
  status: z.enum(["ACTIVE", "IN_REPAIR", "DISPOSED", "STOLEN", "LOST"]).default("ACTIVE"),
  
  // Asset Identification & Internal Codes
  classCode: z.string().optional(),
  costCenterCode: z.string().optional(),
  areaCode: z.string().optional(),
  subareaCode: z.string().optional(),
  branchCode: z.string().optional(),
  serialNumber: z.string().optional(),
  supplierSerialNumber: z.string().optional(),
  
  // Organizational structure
  branchId: z.number().optional(),
  departmentId: z.number().optional(),
  assetTypeId: z.number().optional(),
  
  // Additional identification
  seriesNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  
  // Components
  component1: z.string().optional(),
  component2: z.string().optional(),
  component3: z.string().optional(),
  
  // Supplier & Purchase Information
  supplier: z.string().optional(),
  purchaseDocument: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  quantity: z.number().int().min(1).default(1),
  currency: z.string().default("USD"),
  
  // Financial Information
  acquisitionCost: z.number().min(0, "Must be non-negative"),
  currentValue: z.number().min(0, "Must be non-negative"),
  residualValue: z.number().min(0).default(0),
  acquisitionDate: z.string().transform((str) => new Date(str)),
  serviceDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  
  // Depreciation Settings
  depreciationMethod: z.enum([
    "STRAIGHT_LINE",
    "DECLINING_BALANCE",
    "UNITS_OF_PRODUCTION",
    "SUM_OF_YEARS_DIGITS",
  ]).default("STRAIGHT_LINE"),
  usefulLifeYears: z.number().int().min(1).optional(),
  convention: z.enum(["HALF_YEAR", "FULL_YEAR", "MID_MONTH"]).default("HALF_YEAR"),
  depreciationPercentage: z.number().min(0).max(100).optional(),
  depreciationStartDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  
  // Accounting Information
  accountingAssetAccount: z.string().optional(),
  accumulatedDepreciationAccount: z.string().optional(),
  depreciationExpenseAccount: z.string().optional(),
  fixedAssetLedger: z.string().optional(),
  
  // Physical Details & Location
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  locationId: z.number().optional(),
  
  // Activity & Project
  activityProject: z.string().optional(),
  
  // Observations
  observations: z.string().optional(),
  
  // Assignment (optional - can be assigned later)
  assignedToUserId: z.number().optional(),
});

export const bulkImportAssets = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      assets: z.array(bulkAssetInputSchema).min(1, "At least one asset is required"),
    })
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

    // Check for duplicate asset tags in the input
    const assetTagsInInput = input.assets.map((a) => a.assetTag);
    const duplicatesInInput = assetTagsInInput.filter(
      (tag, index) => assetTagsInInput.indexOf(tag) !== index
    );
    if (duplicatesInInput.length > 0) {
      throw new Error(
        `Duplicate asset tags found in import file: ${duplicatesInInput.join(", ")}`
      );
    }

    // Check for existing asset tags in the database
    const existingAssets = await db.asset.findMany({
      where: {
        assetTag: { in: assetTagsInInput },
        companyId: auth.companyId,
      },
      select: { assetTag: true },
    });

    if (existingAssets.length > 0) {
      throw new Error(
        `The following asset tags already exist: ${existingAssets.map((a) => a.assetTag).join(", ")}`
      );
    }

    // Process each asset
    for (let i = 0; i < input.assets.length; i++) {
      const assetData = input.assets[i];
      
      try {
        // Create the asset
        const asset = await db.asset.create({
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
            component1: assetData.component1,
            component2: assetData.component2,
            component3: assetData.component3,
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
            accumulatedDepreciationAccount: assetData.accumulatedDepreciationAccount,
            depreciationExpenseAccount: assetData.depreciationExpenseAccount,
            fixedAssetLedger: assetData.fixedAssetLedger,
            manufacturer: assetData.manufacturer,
            model: assetData.model,
            locationId: assetData.locationId,
            activityProject: assetData.activityProject,
            observations: assetData.observations,
            assignedToUserId: assetData.assignedToUserId,
          },
        });

        // Create asset assignment if user is assigned
        if (assetData.assignedToUserId) {
          await db.assetAssignment.create({
            data: {
              assetId: asset.id,
              userId: assetData.assignedToUserId,
              startDate: new Date(),
              notes: "Initial assignment during bulk import",
              fixedAssetCode: assetData.assetTag,
            },
          });
        }

        // Generate QR code for the asset
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
          }
        );

        // Construct the public URL
        const qrCodeUrl = `${minioBaseUrl}/asset-photos/${objectName}`;

        // Update the asset with the QR code URL
        await db.asset.update({
          where: { id: asset.id },
          data: { qrCodeUrl },
        });

        results.successCount++;
        results.createdAssetIds.push(asset.id);
      } catch (error) {
        results.failureCount++;
        results.errors.push({
          row: i + 1,
          assetTag: assetData.assetTag,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Create audit log for the bulk import
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "BULK_IMPORT",
      entityType: "ASSET",
      entityId: 0, // No specific entity ID for bulk operations
      newValues: {
        totalProcessed: results.totalProcessed,
        successCount: results.successCount,
        failureCount: results.failureCount,
      },
    });

    return results;
  });
