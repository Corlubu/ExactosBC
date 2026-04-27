import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const getTransferProcess = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      processId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

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

    if (process.companyId !== auth.companyId) {
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
