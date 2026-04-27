import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listUsers = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      activeOnly: z.boolean().optional().default(true),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const users = await db.user.findMany({
      where: {
        companyId: auth.companyId,
        ...(input.activeOnly ? { isActive: true } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        position: true,
        identificationNumber: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    });

    return {
      users,
    };
  });
