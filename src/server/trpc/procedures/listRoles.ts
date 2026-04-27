import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";

export const listRoles = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.roles");

    const roles = await db.role.findMany({
      where: {
        companyId: auth.companyId,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        userCount: role._count.users,
        permissions: role.permissions.map((rp) => rp.permission),
        createdAt: role.createdAt,
      })),
    };
  });
