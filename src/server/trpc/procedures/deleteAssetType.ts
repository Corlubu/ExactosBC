import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteAssetType = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if asset type exists and belongs to the company
    const existingAssetType = await db.assetType.findFirst({
      where: {
        id: input.id,
        companyId: ctx.companyId,
      },
      include: {
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });

    if (!existingAssetType) {
      throw new Error("Asset type not found");
    }

    // Check if asset type has assets
    if (existingAssetType._count.assets > 0) {
      throw new Error(
        "Cannot delete asset type with existing assets. Please delete or reassign assets first.",
      );
    }

    await db.assetType.delete({
      where: { id: input.id },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "DELETE",
      entityType: "ASSET_TYPE",
      entityId: input.id,
      oldValues: {
        name: existingAssetType.name,
        code: existingAssetType.code,
      },
    });

    return { success: true };
  });
