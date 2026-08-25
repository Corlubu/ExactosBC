import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const cancelTransferProcess = protectedProcedure
  .input(
    z.object({
      processId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Verify the process exists
    const process = await db.inventoryProcess.findUnique({
      where: { id: input.processId },
    });

    if (!process) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Transfer process not found",
      });
    }

    if (process.companyId !== ctx.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    if (process.status !== "IN_PROGRESS") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Can only cancel processes that are in progress",
      });
    }

    // Update the process status
    await db.inventoryProcess.update({
      where: { id: input.processId },
      data: {
        status: "CANCELLED",
        endDate: new Date(),
      },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "CANCEL",
      entityType: "INVENTORY_PROCESS",
      entityId: process.id,
      oldValues: {
        status: "IN_PROGRESS",
      },
      newValues: {
        status: "CANCELLED",
      },
    });

    return {
      success: true,
    };
  });
