import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";

export const listPermissions = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    await requirePermission(input.authToken, "admin.roles");

    const permissions = await db.permission.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return {
      permissions,
      groupedPermissions,
    };
  });
