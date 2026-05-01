import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateAssetType = baseProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(1, "Asset type name is required"),
      code: z.string().min(1, "Asset type code is required"),
      acronym: z.string().optional(),
      isDepreciable: z.boolean().optional(),
      accountingAccount: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Check if asset type exists and belongs to the company
    const existingAssetType = await db.assetType.findFirst({
      where: {
        id: input.id,
        companyId: auth.companyId,
      },
    });

    if (!existingAssetType) {
      throw new Error("Asset type not found");
    }

    // Check if the new code conflicts with another asset type
    if (input.code !== existingAssetType.code) {
      const codeConflict = await db.assetType.findFirst({
        where: {
          code: input.code,
          companyId: auth.companyId,
          id: { not: input.id },
        },
      });

      if (codeConflict) {
        throw new Error("An asset type with this code already exists");
      }
    }

    const assetType = await db.assetType.update({
      where: { id: input.id },
      data: {
        name: input.name,
        code: input.code,
        acronym: input.acronym,
        isDepreciable: input.isDepreciable,
        accountingAccount: input.accountingAccount,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "ASSET_TYPE",
      entityId: assetType.id,
      oldValues: {
        name: existingAssetType.name,
        code: existingAssetType.code,
        acronym: existingAssetType.acronym,
        isDepreciable: existingAssetType.isDepreciable,
        accountingAccount: existingAssetType.accountingAccount,
      },
      newValues: {
        name: assetType.name,
        code: assetType.code,
        acronym: assetType.acronym,
        isDepreciable: assetType.isDepreciable,
        accountingAccount: assetType.accountingAccount,
      },
    });

    return {
      id: assetType.id,
      name: assetType.name,
      code: assetType.code,
      acronym: assetType.acronym,
      isDepreciable: assetType.isDepreciable,
      accountingAccount: assetType.accountingAccount,
    };
  });
