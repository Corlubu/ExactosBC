import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listTransferProcesses = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      cursor: z.number().optional(),
      limit: z.number().min(1).max(100).default(50),
      status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
      type: z.enum(["TRANSFER", "RECEPTION"]).optional(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const where: {
      companyId: number;
      type?: { in: string[] };
      status?: string;
    } = {
      companyId: auth.companyId,
      type: { in: ["TRANSFER", "RECEPTION"] },
    };

    if (input.status) {
      where.status = input.status;
    }

    if (input.type) {
      where.type = { in: [input.type] };
    }

    const processes = await db.inventoryProcess.findMany({
      where,
      include: {
        location: true,
        movements: {
          include: {
            asset: {
              select: {
                id: true,
                assetTag: true,
                name: true,
              },
            },
            fromLocation: {
              select: {
                id: true,
                name: true,
              },
            },
            toLocation: {
              select: {
                id: true,
                name: true,
              },
            },
            fromUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            toUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      take: input.limit + 1,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    });

    let nextCursor: number | undefined = undefined;
    if (processes.length > input.limit) {
      const nextItem = processes.pop();
      nextCursor = nextItem?.id;
    }

    return {
      processes: processes.map((process) => ({
        id: process.id,
        type: process.type,
        status: process.status,
        startDate: process.startDate,
        endDate: process.endDate,
        notes: process.notes,
        location: process.location
          ? {
              id: process.location.id,
              name: process.location.name,
            }
          : null,
        assetCount: process.movements.length,
        movements: process.movements.map((movement) => ({
          id: movement.id,
          asset: movement.asset,
          fromLocation: movement.fromLocation,
          toLocation: movement.toLocation,
          fromUser: movement.fromUser,
          toUser: movement.toUser,
          notes: movement.notes,
          movementDate: movement.movementDate,
        })),
      })),
      nextCursor,
    };
  });
