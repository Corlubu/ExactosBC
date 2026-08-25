import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteAssetSubclass = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if asset subclass exists and belongs to the company
    const assetSubclass = await db.assetSubclass.findFirst({
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

    if (!assetSubclass) {
      throw new Error("Asset subclass not found");
    }

    // Check if there are any assets using this subclass
    if (assetSubclass._count.assets > 0) {
      throw new Error("Cannot delete asset subclass with existing assets");
    }

    await db.assetSubclass.delete({
      where: { id: input.id },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "DELETE",
      entityType: "ASSET_SUBCLASS",
      entityId: assetSubclass.id,
      oldValues: {
        classId: assetSubclass.classId,
        description: assetSubclass.description,
        abbreviation: assetSubclass.abbreviation,
      },
    });

    return { success: true };
  });
