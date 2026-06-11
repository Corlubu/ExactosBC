import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";

// Cambiamos baseProcedure por protectedProcedure
export const getCurrentUser = protectedProcedure
  .input(
    // Dejamos el input opcional para no romper el frontend si aún envía el authToken
    z
      .object({
        authToken: z.string().optional(),
      })
      .optional(),
  )
  .query(({ ctx }) => {
    // Ya no necesitamos llamar a authenticateRequest manualmente.
    // protectedProcedure ya validó el token y nos dejó el usuario seguro en `ctx.user`.
    const { user, permissions } = ctx;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      companyName: user.company.name,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
          }
        : null,
      permissions: permissions, // Permisos extraídos directamente del middleware
    };
  });
