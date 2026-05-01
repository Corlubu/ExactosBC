import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const completeTransferProcess = baseProcedure
  .input(
    z.object({
      processId: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "inventory.transfer");

    // Verify the process exists and is in progress
    const process = await db.inventoryProcess.findUnique({
      where: { id: input.processId },
      include: {
        movements: {
          include: {
            asset: true,
          },
        },
      },
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
        message: "Process is not in progress",
      });
    }

    if (process.movements.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot complete a transfer with no assets",
      });
    }

    // Use a transaction to ensure atomicity
    await db.$transaction(async (tx) => {
      // Update each asset's location and custodian
      for (const movement of process.movements) {
        const updateData: {
          locationId?: number | null;
          assignedToUserId?: number | null;
        } = {};

        if (movement.toLocationId !== undefined) {
          updateData.locationId = movement.toLocationId;
        }

        if (movement.toUserId !== undefined) {
          updateData.assignedToUserId = movement.toUserId;
        }

        // Update the asset
        await tx.asset.update({
          where: { id: movement.assetId },
          data: updateData,
        });

        // If there's a new user assignment, close old assignments and create new one
        if (movement.toUserId) {
          // Close any open assignments
          await tx.assetAssignment.updateMany({
            where: {
              assetId: movement.assetId,
              endDate: null,
            },
            data: {
              endDate: new Date(),
            },
          });

          // Create new assignment
          await tx.assetAssignment.create({
            data: {
              assetId: movement.assetId,
              userId: movement.toUserId,
              startDate: new Date(),
              notes: `Transferred via process #${process.id}`,
            },
          });
        }

        // Update the movement record with status snapshot
        await tx.assetMovement.update({
          where: { id: movement.id },
          data: {
            previousStatus: movement.asset.status,
            newStatus: movement.asset.status,
          },
        });

        // Create audit log for each asset
        await createAuditLog({
          userId: auth.user.id,
          companyId: auth.companyId,
          action: "TRANSFER",
          entityType: "ASSET",
          entityId: movement.assetId,
          assetId: movement.assetId,
          oldValues: {
            locationId: movement.fromLocationId,
            assignedToUserId: movement.fromUserId,
          },
          newValues: {
            locationId: movement.toLocationId,
            assignedToUserId: movement.toUserId,
          },
        });
      }

      // Mark the process as completed
      await tx.inventoryProcess.update({
        where: { id: input.processId },
        data: {
          status: "COMPLETED",
          endDate: new Date(),
        },
      });
    });

    // Create audit log for the process completion
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "COMPLETE",
      entityType: "INVENTORY_PROCESS",
      entityId: process.id,
      newValues: {
        status: "COMPLETED",
        assetsTransferred: process.movements.length,
      },
    });

    return {
      success: true,
      assetsTransferred: process.movements.length,
    };
  });
