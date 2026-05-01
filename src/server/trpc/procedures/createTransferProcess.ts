import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createTransferProcess = baseProcedure
  .input(
    z.object({
      type: z.enum(["TRANSFER", "RECEPTION"]),
      notes: z.string().optional(),
      locationId: z.number().optional(),
      assets: z
        .array(
          z.object({
            assetId: z.number(),
            fromLocationId: z.number().optional(),
            fromUserId: z.number().optional(),
            toLocationId: z.number().optional(),
            toUserId: z.number().optional(),
            notes: z.string().optional(),
          }),
        )
        .optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "inventory.transfer");

    // Create the inventory process
    const process = await db.inventoryProcess.create({
      data: {
        companyId: auth.companyId,
        type: input.type,
        status: "IN_PROGRESS",
        notes: input.notes,
        locationId: input.locationId,
      },
    });

    // If assets are provided, create asset movements
    if (input.assets && input.assets.length > 0) {
      await db.assetMovement.createMany({
        data: input.assets.map((asset) => ({
          processId: process.id,
          assetId: asset.assetId,
          fromLocationId: asset.fromLocationId,
          fromUserId: asset.fromUserId,
          toLocationId: asset.toLocationId,
          toUserId: asset.toUserId,
          notes: asset.notes,
        })),
      });
    }

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "CREATE",
      entityType: "INVENTORY_PROCESS",
      entityId: process.id,
      newValues: {
        type: process.type,
        status: process.status,
        assetCount: input.assets?.length || 0,
      },
    });

    return {
      id: process.id,
      type: process.type,
      status: process.status,
      startDate: process.startDate,
    };
  });
