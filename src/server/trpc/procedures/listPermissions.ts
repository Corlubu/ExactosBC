import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listPermissions = protectedProcedure
  .input(z.object({}).optional()) // El input puede ir vacío ahora
  .query(async () => {
    const permissions = await db.permission.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Group by category
    const groupedPermissions = permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );

    return {
      permissions,
      groupedPermissions,
    };
  });
