import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const getAsset = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      assetId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const asset = await db.asset.findFirst({
      where: {
        id: input.assetId,
        companyId: auth.companyId,
      },
      include: {
        location: true,
        branch: true,
        department: {
          include: {
            branch: true,
          },
        },
        assetType: true,
        enteredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignments: {
          include: {
            user: true,
          },
          orderBy: {
            startDate: "desc",
          },
        },
        maintenanceRecords: {
          orderBy: {
            performedDate: "desc",
          },
          take: 10,
        },
        depreciationCalculations: {
          orderBy: {
            calculationDate: "desc",
          },
          take: 12,
        },
        attachments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        assignedToUser: true,
      },
    });

    if (!asset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Asset not found",
      });
    }

    return {
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      description: asset.description,
      category: asset.category,
      status: asset.status,
      acquisitionCost: asset.acquisitionCost,
      currentValue: asset.currentValue,
      residualValue: asset.residualValue,
      acquisitionDate: asset.acquisitionDate,
      serviceDate: asset.serviceDate,
      depreciationMethod: asset.depreciationMethod,
      usefulLifeYears: asset.usefulLifeYears,
      usefulLifeUnits: asset.usefulLifeUnits,
      currentUnits: asset.currentUnits,
      convention: asset.convention,
      disposalDate: asset.disposalDate,
      disposalValue: asset.disposalValue,
      serialNumber: asset.serialNumber,
      manufacturer: asset.manufacturer,
      model: asset.model,
      photoUrl: asset.photoUrl,
      qrCodeUrl: asset.qrCodeUrl,
      createdAt: asset.createdAt,
      location: asset.location,
      assignments: asset.assignments.map((assignment) => ({
        id: assignment.id,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        notes: assignment.notes,
        user: {
          id: assignment.user.id,
          firstName: assignment.user.firstName,
          lastName: assignment.user.lastName,
          email: assignment.user.email,
        },
      })),
      maintenanceRecords: asset.maintenanceRecords,
      depreciationCalculations: asset.depreciationCalculations,
      supplier: asset.supplier,
      purchaseDocument: asset.purchaseDocument,
      supplierSerialNumber: asset.supplierSerialNumber,
      unitCost: asset.unitCost,
      quantity: asset.quantity,
      currency: asset.currency,
      depreciationPercentage: asset.depreciationPercentage,
      depreciationStartDate: asset.depreciationStartDate,
      accountingAssetAccount: asset.accountingAssetAccount,
      accumulatedDepreciationAccount: asset.accumulatedDepreciationAccount,
      depreciationExpenseAccount: asset.depreciationExpenseAccount,
      fixedAssetLedger: asset.fixedAssetLedger,
      classCode: asset.classCode,
      costCenterCode: asset.costCenterCode,
      areaCode: asset.areaCode,
      subareaCode: asset.subareaCode,
      branchCode: asset.branchCode,
      activityProject: asset.activityProject,
      observations: asset.observations,
      branch: asset.branch ? {
        id: asset.branch.id,
        name: asset.branch.name,
        code: asset.branch.code,
      } : null,
      department: asset.department ? {
        id: asset.department.id,
        name: asset.department.name,
        code: asset.department.code,
        branch: {
          id: asset.department.branch.id,
          name: asset.department.branch.name,
          code: asset.department.branch.code,
        },
      } : null,
      assetType: asset.assetType ? {
        id: asset.assetType.id,
        name: asset.assetType.name,
        code: asset.assetType.code,
      } : null,
      enteredBy: asset.enteredBy ? {
        id: asset.enteredBy.id,
        firstName: asset.enteredBy.firstName,
        lastName: asset.enteredBy.lastName,
        email: asset.enteredBy.email,
      } : null,
      seriesNumber: asset.seriesNumber,
      invoiceNumber: asset.invoiceNumber,
      component1: asset.component1,
      component2: asset.component2,
      component3: asset.component3,
      assignedToUser: asset.assignedToUser ? {
        id: asset.assignedToUser.id,
        firstName: asset.assignedToUser.firstName,
        lastName: asset.assignedToUser.lastName,
        email: asset.assignedToUser.email,
      } : null,
      attachments: asset.attachments,
    };
  });
