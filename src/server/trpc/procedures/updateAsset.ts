import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateAsset = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      assetId: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      acquisitionCost: z.number().min(0).optional(),
      currentValue: z.number().min(0).optional(),
      residualValue: z.number().min(0).optional(),
      serviceDate: z.date().optional(),
      depreciationMethod: z.enum([
        "STRAIGHT_LINE",
        "DECLINING_BALANCE",
        "UNITS_OF_PRODUCTION",
        "SUM_OF_YEARS_DIGITS",
      ]).optional(),
      usefulLifeYears: z.number().int().min(1).optional(),
      usefulLifeUnits: z.number().int().min(1).optional(),
      convention: z.enum(["HALF_YEAR", "FULL_YEAR", "MID_MONTH"]).optional(),
      status: z.enum(["ACTIVE", "IN_REPAIR", "DISPOSED", "STOLEN", "LOST"]).optional(),
      serialNumber: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      locationId: z.number().nullable().optional(),
      photoUrl: z.string().nullable().optional(),
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
      branchId: z.number().nullable().optional(),
      departmentId: z.number().nullable().optional(),
      assetTypeId: z.number().nullable().optional(),
      
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
      assignedToUserId: z.number().nullable().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "assets.edit");

    // Get existing asset
    const existingAsset = await db.asset.findFirst({
      where: {
        id: input.assetId,
        companyId: auth.companyId,
      },
    });

    if (!existingAsset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Asset not found",
      });
    }

    // Build update data object
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.acquisitionCost !== undefined) updateData.acquisitionCost = input.acquisitionCost;
    if (input.currentValue !== undefined) updateData.currentValue = input.currentValue;
    if (input.residualValue !== undefined) updateData.residualValue = input.residualValue;
    if (input.serviceDate !== undefined) updateData.serviceDate = input.serviceDate;
    if (input.depreciationMethod !== undefined) updateData.depreciationMethod = input.depreciationMethod;
    if (input.usefulLifeYears !== undefined) updateData.usefulLifeYears = input.usefulLifeYears;
    if (input.usefulLifeUnits !== undefined) updateData.usefulLifeUnits = input.usefulLifeUnits;
    if (input.convention !== undefined) updateData.convention = input.convention;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.serialNumber !== undefined) updateData.serialNumber = input.serialNumber;
    if (input.manufacturer !== undefined) updateData.manufacturer = input.manufacturer;
    if (input.model !== undefined) updateData.model = input.model;
    if (input.locationId !== undefined) updateData.locationId = input.locationId;
    if (input.photoUrl !== undefined) updateData.photoUrl = input.photoUrl;
    if (input.supplier !== undefined) updateData.supplier = input.supplier;
    if (input.purchaseDocument !== undefined) updateData.purchaseDocument = input.purchaseDocument;
    if (input.supplierSerialNumber !== undefined) updateData.supplierSerialNumber = input.supplierSerialNumber;
    if (input.unitCost !== undefined) updateData.unitCost = input.unitCost;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.depreciationPercentage !== undefined) updateData.depreciationPercentage = input.depreciationPercentage;
    if (input.depreciationStartDate !== undefined) updateData.depreciationStartDate = input.depreciationStartDate;
    if (input.accountingAssetAccount !== undefined) updateData.accountingAssetAccount = input.accountingAssetAccount;
    if (input.accumulatedDepreciationAccount !== undefined) updateData.accumulatedDepreciationAccount = input.accumulatedDepreciationAccount;
    if (input.depreciationExpenseAccount !== undefined) updateData.depreciationExpenseAccount = input.depreciationExpenseAccount;
    if (input.fixedAssetLedger !== undefined) updateData.fixedAssetLedger = input.fixedAssetLedger;
    if (input.classCode !== undefined) updateData.classCode = input.classCode;
    if (input.costCenterCode !== undefined) updateData.costCenterCode = input.costCenterCode;
    if (input.areaCode !== undefined) updateData.areaCode = input.areaCode;
    if (input.subareaCode !== undefined) updateData.subareaCode = input.subareaCode;
    if (input.branchCode !== undefined) updateData.branchCode = input.branchCode;
    if (input.branchId !== undefined) updateData.branchId = input.branchId;
    if (input.departmentId !== undefined) updateData.departmentId = input.departmentId;
    if (input.assetTypeId !== undefined) updateData.assetTypeId = input.assetTypeId;
    if (input.seriesNumber !== undefined) updateData.seriesNumber = input.seriesNumber;
    if (input.invoiceNumber !== undefined) updateData.invoiceNumber = input.invoiceNumber;
    if (input.component1 !== undefined) updateData.component1 = input.component1;
    if (input.component2 !== undefined) updateData.component2 = input.component2;
    if (input.component3 !== undefined) updateData.component3 = input.component3;
    if (input.activityProject !== undefined) updateData.activityProject = input.activityProject;
    if (input.observations !== undefined) updateData.observations = input.observations;
    if (input.assignedToUserId !== undefined) updateData.assignedToUserId = input.assignedToUserId;

    const asset = await db.asset.update({
      where: {
        id: input.assetId,
      },
      data: updateData,
      include: {
        location: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "ASSET",
      entityId: asset.id,
      assetId: asset.id,
      oldValues: {
        name: existingAsset.name,
        category: existingAsset.category,
        status: existingAsset.status,
      },
      newValues: {
        name: asset.name,
        category: asset.category,
        status: asset.status,
      },
    });

    return {
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      status: asset.status,
    };
  });
