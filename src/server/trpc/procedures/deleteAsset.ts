import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteAsset = protectedProcedure
  .input(
    z.object({
      assetId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const asset = await db.asset.findFirst({
      where: {
        id: input.assetId,
        companyId: ctx.companyId,
      },
    });

    if (!asset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Asset not found",
      });
    }

    await db.asset.delete({
      where: {
        id: input.assetId,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "DELETE",
      entityType: "ASSET",
      entityId: asset.id,
      assetId: asset.id,
      oldValues: {
        assetTag: asset.assetTag,
        name: asset.name,
        category: asset.category,
      },
    });

    return {
      success: true,
    };
  });
