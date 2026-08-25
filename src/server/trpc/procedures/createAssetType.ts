import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createAssetType = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1, "Asset type name is required"),
      code: z.string().min(1, "Asset type code is required"),
      acronym: z.string().optional(),
      isDepreciable: z.boolean().default(true),
      accountingAccount: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if asset type code already exists for this company
    const existingAssetType = await db.assetType.findFirst({
      where: {
        code: input.code,
        companyId: ctx.companyId,
      },
    });

    if (existingAssetType) {
      throw new Error("An asset type with this code already exists");
    }

    const assetType = await db.assetType.create({
      data: {
        companyId: ctx.companyId,
        name: input.name,
        code: input.code,
        acronym: input.acronym,
        isDepreciable: input.isDepreciable,
        accountingAccount: input.accountingAccount,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "CREATE",
      entityType: "ASSET_TYPE",
      entityId: assetType.id,
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
