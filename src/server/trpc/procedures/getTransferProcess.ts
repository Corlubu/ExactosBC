import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getTransferProcess = protectedProcedure
  .input(
    z.object({
      processId: z.number(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const process = await db.inventoryProcess.findUnique({
      where: { id: input.processId },
      include: {
        location: true,
        movements: {
          include: {
            asset: {
              select: {
                id: true,
                assetTag: true,
                name: true,
                category: true,
                status: true,
                photoUrl: true,
              },
            },
            fromLocation: true,
            toLocation: true,
            fromUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            toUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            movementDate: "asc",
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

    if (process.companyId !== ctx.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    return {
      id: process.id,
      type: process.type,
      status: process.status,
      startDate: process.startDate,
      endDate: process.endDate,
      notes: process.notes,
      location: process.location,
      movements: process.movements.map((movement) => ({
        id: movement.id,
        asset: movement.asset,
        fromLocation: movement.fromLocation,
        toLocation: movement.toLocation,
        fromUser: movement.fromUser,
        toUser: movement.toUser,
        previousStatus: movement.previousStatus,
        newStatus: movement.newStatus,
        notes: movement.notes,
        movementDate: movement.movementDate,
      })),
    };
  });
