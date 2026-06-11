import { z } from "zod";
import { db } from "~/server/db";
import { protectedProcedureWithPermission } from "~/server/trpc/main";

// Fíjate cómo pasamos el permiso requerido directamente aquí
export const listRoles = protectedProcedureWithPermission("admin.roles")
  .input(
    z
      .object({
        // Puedes añadir cursores o limitadores aquí en el futuro
      })
      .optional(), // Lo hacemos opcional por si no envían nada
  )
  .query(async ({ ctx }) => {
    // 1. Obtenemos los datos seguros desde el Contexto
    // Ya no necesitas 'user' aquí a menos que uses su ID, el middleware ya validó todo.
    const { companyId } = ctx;

    // 2. Ejecutamos la consulta filtrando por Tenant (companyId)
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
