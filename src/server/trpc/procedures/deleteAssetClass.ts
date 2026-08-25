import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteAssetClass = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if asset class exists and belongs to the company
    const assetClass = await db.assetClass.findFirst({
      where: {
        id: input.id,
        companyId: ctx.companyId,
      },
      include: {
        _count: {
          select: {
            assetSubclasses: true,
            assets: true,
          },
        },
      },
    });

    if (!assetClass) {
      throw new Error("Asset class not found");
    }

    // Check if there are any subclasses or assets using this class
    if (assetClass._count.assetSubclasses > 0) {
      throw new Error("Cannot delete asset class with existing subclasses");
    }

    if (assetClass._count.assets > 0) {
      throw new Error("Cannot delete asset class with existing assets");
    }

    await db.assetClass.delete({
      where: { id: input.id },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "DELETE",
      entityType: "ASSET_CLASS",
      entityId: assetClass.id,
      oldValues: {
        assetTypeId: assetClass.assetTypeId,
        code: assetClass.code,
        description: assetClass.description,
        accountingAccount: assetClass.accountingAccount,
        budgetCode: assetClass.budgetCode,
      },
    });

    return { success: true };
  });
