import { z } from "zod";
import { db } from "~/server/db";
import { protectedProcedure } from "~/server/trpc/main";
import { checkContextPermission } from "~/server/utils/auth";

export const listRoles = protectedProcedure
  .input(
    z
      .object({
        // ELIMINADO: authToken: z.string(),
        // Puedes añadir cursores o limitadores aquí en el futuro
      })
      .optional(), // Lo hacemos opcional por si no envían nada
  )
  .query(async ({ ctx }) => {
    // 1. Obtenemos los datos seguros desde el Contexto
    const { companyId, user } = ctx;

    // 2. Verificamos que tenga el permiso usando el nuevo Helper
    await checkContextPermission(user.id, "admin.roles");

    // 3. Ejecutamos la consulta filtrando por Tenant (companyId)
    const roles = await db.role.findMany({
      where: {
        companyId: companyId,
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
