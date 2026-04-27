import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const addAssetsToTransfer = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      processId: z.number(),
      assets: z.array(
        z.object({
          assetId: z.number(),
          fromLocationId: z.number().optional(),
          fromUserId: z.number().optional(),
          toLocationId: z.number().optional(),
          toUserId: z.number().optional(),
          notes: z.string().optional(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "inventory.transfer");

    // Verify the process exists and is in progress
    const process = await db.inventoryProcess.findUnique({
      where: { id: input.processId },
    });

    if (!process) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Transfer process not found",
      });
    }

    if (process.companyId !== auth.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    if (process.status !== "IN_PROGRESS") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot add assets to a completed or cancelled process",
      });
    }

    // Add the asset movements
    await db.assetMovement.createMany({
      data: input.assets.map((asset) => ({
        processId: input.processId,
        assetId: asset.assetId,
        fromLocationId: asset.fromLocationId,
        fromUserId: asset.fromUserId,
        toLocationId: asset.toLocationId,
        toUserId: asset.toUserId,
        notes: asset.notes,
      })),
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "INVENTORY_PROCESS",
      entityId: process.id,
      newValues: {
        assetsAdded: input.assets.length,
      },
    });

    return {
      success: true,
      assetsAdded: input.assets.length,
    };
  });
