import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteAsset = baseProcedure
  .input(
    z.object({
      assetId: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "assets.delete");

    const asset = await db.asset.findFirst({
      where: {
        id: input.assetId,
        companyId: auth.companyId,
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
      userId: auth.user.id,
      companyId: auth.companyId,
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
