import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";
import QRCode from "qrcode";
import { minioClient, minioBaseUrl } from "~/server/minio";

export const createAsset = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      assetTag: z.string().min(1, "Asset tag is required"),
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      category: z.string().min(1, "Category is required"),
      acquisitionCost: z.number().min(0, "Acquisition cost must be non-negative"),
      currentValue: z.number().min(0, "Current value must be non-negative"),
      residualValue: z.number().min(0).default(0),
      acquisitionDate: z.date(),
      serviceDate: z.date().optional(),
      depreciationMethod: z.enum([
        "STRAIGHT_LINE",
        "DECLINING_BALANCE",
        "UNITS_OF_PRODUCTION",
        "SUM_OF_YEARS_DIGITS",
      ]).default("STRAIGHT_LINE"),
      usefulLifeYears: z.number().int().min(1).optional(),
      usefulLifeUnits: z.number().int().min(1).optional(),
      convention: z.enum(["HALF_YEAR", "FULL_YEAR", "MID_MONTH"]).default("HALF_YEAR"),
      status: z.enum(["ACTIVE", "IN_REPAIR", "DISPOSED", "STOLEN", "LOST"]).default("ACTIVE"),
      serialNumber: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      locationId: z.number().optional(),
      photoUrl: z.string().optional(),
      
      // Supplier & Purchase Information
      supplier: z.string().optional(),
      purchaseDocument: z.string().optional(),
      supplierSerialNumber: z.string().optional(),
      unitCost: z.number().min(0).optional(),
      quantity: z.number().int().min(1).optional(),
      currency: z.string().optional(),
      
      // Depreciation Details
      depreciationPercentage: z.number().min(0).max(100).optional(),
      depreciationStartDate: z.date().optional(),
      
      // Accounting Information
      accountingAssetAccount: z.string().optional(),
      accumulatedDepreciationAccount: z.string().optional(),
      depreciationExpenseAccount: z.string().optional(),
      fixedAssetLedger: z.string().optional(),
      
      // Organizational Structure
      classCode: z.string().optional(),
      costCenterCode: z.string().optional(),
      areaCode: z.string().optional(),
      subareaCode: z.string().optional(),
      branchCode: z.string().optional(),
      
      // New organizational structure
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
      
      // Activity & Project
      activityProject: z.string().optional(),
      
      // Additional Information
      observations: z.string().optional(),
      
      // User Assignment
      assignedToUserId: z.number().optional(),
      
      // Custody Certificate Details (for initial assignment)
      assignmentBriefDescription: z.string().optional(),
      assignmentFixedAssetCode: z.string().optional(),
      assignmentInitialCondition: z.string().optional(),
      assignmentMaintenanceObligations: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "assets.create");

    // Check if asset tag already exists for this company
    const existingAsset = await db.asset.findFirst({
      where: {
        assetTag: input.assetTag,
        companyId: auth.companyId,
      },
    });

    if (existingAsset) {
      throw new Error("An asset with this tag already exists");
    }

    const asset = await db.asset.create({
      data: {
        companyId: auth.companyId,
        assetTag: input.assetTag,
        name: input.name,
        description: input.description,
        category: input.category,
        acquisitionCost: input.acquisitionCost,
        currentValue: input.currentValue,
        residualValue: input.residualValue,
        acquisitionDate: input.acquisitionDate,
        serviceDate: input.serviceDate,
        depreciationMethod: input.depreciationMethod,
        usefulLifeYears: input.usefulLifeYears,
        usefulLifeUnits: input.usefulLifeUnits,
        convention: input.convention,
        status: input.status,
        serialNumber: input.serialNumber,
        manufacturer: input.manufacturer,
        model: input.model,
        locationId: input.locationId,
        photoUrl: input.photoUrl,
        supplier: input.supplier,
        purchaseDocument: input.purchaseDocument,
        supplierSerialNumber: input.supplierSerialNumber,
        unitCost: input.unitCost,
        quantity: input.quantity,
        currency: input.currency,
        depreciationPercentage: input.depreciationPercentage,
        depreciationStartDate: input.depreciationStartDate,
        accountingAssetAccount: input.accountingAssetAccount,
        accumulatedDepreciationAccount: input.accumulatedDepreciationAccount,
        depreciationExpenseAccount: input.depreciationExpenseAccount,
        fixedAssetLedger: input.fixedAssetLedger,
        classCode: input.classCode,
        costCenterCode: input.costCenterCode,
        areaCode: input.areaCode,
        subareaCode: input.subareaCode,
        branchCode: input.branchCode,
        branchId: input.branchId,
        departmentId: input.departmentId,
        assetTypeId: input.assetTypeId,
        enteredById: auth.user.id, // Automatically set from authenticated user
        seriesNumber: input.seriesNumber,
        invoiceNumber: input.invoiceNumber,
        component1: input.component1,
        component2: input.component2,
        component3: input.component3,
        activityProject: input.activityProject,
        observations: input.observations,
        assignedToUserId: input.assignedToUserId,
      },
      include: {
        location: true,
        branch: true,
        department: true,
        assetType: true,
        enteredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create asset assignment if user is assigned
    if (input.assignedToUserId) {
      await db.assetAssignment.create({
        data: {
          assetId: asset.id,
          userId: input.assignedToUserId,
          startDate: new Date(),
          notes: "Initial assignment upon asset creation",
          briefDescription: input.assignmentBriefDescription,
          fixedAssetCode: input.assignmentFixedAssetCode || input.assetTag,
          initialCondition: input.assignmentInitialCondition,
          maintenanceObligations: input.assignmentMaintenanceObligations,
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
      where: {
        id: asset.id,
      },
      data: {
        qrCodeUrl,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "CREATE",
      entityType: "ASSET",
      entityId: asset.id,
      assetId: asset.id,
      newValues: {
        assetTag: asset.assetTag,
        name: asset.name,
        category: asset.category,
        acquisitionCost: asset.acquisitionCost,
      },
    });

    return {
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      description: asset.description,
      category: asset.category,
      status: asset.status,
      acquisitionCost: asset.acquisitionCost,
      currentValue: asset.currentValue,
      location: asset.location,
      qrCodeUrl,
    };
  });
