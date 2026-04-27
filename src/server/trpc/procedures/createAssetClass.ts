import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createAssetClass = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      assetTypeId: z.number(),
      code: z.string().min(1, "Asset class code is required"),
      description: z.string().min(1, "Description is required"),
      accountingAccount: z.string().optional(),
      budgetCode: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

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

    // Check if asset class code already exists for this asset type
    const existingAssetClass = await db.assetClass.findFirst({
      where: {
        code: input.code,
        assetTypeId: input.assetTypeId,
      },
    });

    if (existingAssetClass) {
      throw new Error("An asset class with this code already exists for this asset type");
    }

    const assetClass = await db.assetClass.create({
      data: {
        companyId: auth.companyId,
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
      action: "CREATE",
      entityType: "ASSET_CLASS",
      entityId: assetClass.id,
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
