import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateAssetClass = baseProcedure
  .input(
    z.object({
      id: z.number(),
      assetTypeId: z.number(),
      code: z.string().min(1, "Asset class code is required"),
      description: z.string().min(1, "Description is required"),
      accountingAccount: z.string().optional(),
      budgetCode: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Check if asset class exists and belongs to the company
    const existingAssetClass = await db.assetClass.findFirst({
      where: {
        id: input.id,
        companyId: auth.companyId,
      },
    });

    if (!existingAssetClass) {
      throw new Error("Asset class not found");
    }

    // Verify asset type exists and belongs to company
    const assetType = await db.assetType.findFirst({
      where: {
        id: input.assetTypeId,
        companyId: auth.companyId,
      },
    });

    if (!assetType) {
      throw new Error("Asset type not found");
    }

    // Check if the new code conflicts with another asset class in the same asset type
    if (
      input.code !== existingAssetClass.code ||
      input.assetTypeId !== existingAssetClass.assetTypeId
    ) {
      const codeConflict = await db.assetClass.findFirst({
        where: {
          code: input.code,
          assetTypeId: input.assetTypeId,
          id: { not: input.id },
        },
      });

      if (codeConflict) {
        throw new Error(
          "An asset class with this code already exists for this asset type",
        );
      }
    }

    const assetClass = await db.assetClass.update({
      where: { id: input.id },
      data: {
        assetTypeId: input.assetTypeId,
        code: input.code,
        description: input.description,
        accountingAccount: input.accountingAccount,
        budgetCode: input.budgetCode,
      },
      include: {
        assetType: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "ASSET_CLASS",
      entityId: assetClass.id,
      oldValues: {
        assetTypeId: existingAssetClass.assetTypeId,
        code: existingAssetClass.code,
        description: existingAssetClass.description,
        accountingAccount: existingAssetClass.accountingAccount,
        budgetCode: existingAssetClass.budgetCode,
      },
      newValues: {
        assetTypeId: assetClass.assetTypeId,
        code: assetClass.code,
        description: assetClass.description,
        accountingAccount: assetClass.accountingAccount,
        budgetCode: assetClass.budgetCode,
      },
    });

    return {
      id: assetClass.id,
      assetTypeId: assetClass.assetTypeId,
      code: assetClass.code,
      description: assetClass.description,
      accountingAccount: assetClass.accountingAccount,
      budgetCode: assetClass.budgetCode,
      assetType: {
        id: assetClass.assetType.id,
        name: assetClass.assetType.name,
        code: assetClass.assetType.code,
      },
    };
  });
