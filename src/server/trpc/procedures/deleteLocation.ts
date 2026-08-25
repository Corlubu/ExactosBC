import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteLocation = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const location = await db.location.findUnique({
      where: { id: input.id },
      include: {
        assets: true,
        inventoryProcesses: true,
        movementsFrom: true,
        movementsTo: true,
      },
    });

    if (!location || location.companyId !== ctx.companyId) {
      throw new Error("Location not found");
    }

    // Check for data integrity
    if (location.assets.length > 0) {
      throw new Error(
        `Cannot delete location: ${location.assets.length} asset(s) are assigned to this location`,
      );
    }

    if (location.inventoryProcesses.length > 0) {
      throw new Error(
        `Cannot delete location: ${location.inventoryProcesses.length} inventory process(es) are linked to this location`,
      );
    }

    if (location.movementsFrom.length > 0 || location.movementsTo.length > 0) {
      throw new Error(
        "Cannot delete location: asset movements are linked to this location",
      );
    }

    // Check if any locations have this as parent
    const childLocations = await db.location.findMany({
      where: {
        parentId: input.id,
      },
    });

    if (childLocations.length > 0) {
      throw new Error(
        `Cannot delete location: ${childLocations.length} child location(s) depend on this location`,
      );
    }

    await db.location.delete({
      where: { id: input.id },
    });

    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "DELETE",
      entityType: "LOCATION",
      entityId: input.id,
      oldValues: {
        name: location.name,
        type: location.type,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        parentId: location.parentId,
      },
    });

    return {
      success: true,
    };
  });
