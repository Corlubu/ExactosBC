import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";

export const getCurrentUser = baseProcedure
  .input(
    // Aceptamos el token explícitamente para evitar problemas de hidratación de Zustand/SSR
    z
      .object({
        authToken: z.string().optional(),
      })
      .optional(),
  )
  .query(async ({ input }) => {
    const token = input?.authToken;

    if (!token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No authentication token provided",
      });
    }

    // Autenticamos manualmente usando el token seguro que viajó en el payload
    const auth = await authenticateRequest(token);

    return {
      id: auth.user.id,
      email: auth.user.email,
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
      companyId: auth.user.companyId,
      companyName: auth.user.company.name,
      role: auth.user.role
        ? {
            id: auth.user.role.id,
            name: auth.user.role.name,
            description: auth.user.role.description,
          }
        : null,
      permissions: auth.permissions,
    };
  });
