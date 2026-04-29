import { z } from "zod";
// IMPORTANTE: Aseguramos la autenticación mediante el middleware centralizado
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listUsers = protectedProcedure
  .input(
    z
      .object({
        // Eliminamos authToken. Ahora viaja seguro en los HTTP Headers.
        activeOnly: z.boolean().optional().default(true),
      })
      .optional(), // Permite que la función se llame sin argumentos: trpc.listUsers.useQuery()
  )
  .query(async ({ input, ctx }) => {
    // 1. Extraemos la identidad del usuario y su empresa del contexto validado
    // ctx viene poblado desde el middleware 'enforceUserIsAuthed' en main.ts
    const { companyId } = ctx;

    // 2. Ejecutamos la consulta filtrando obligatoriamente por companyId
    const users = await db.user.findMany({
      where: {
        companyId: companyId,
        // Aplicamos el filtro de estado si se proporciona en el input
        ...(input?.activeOnly !== undefined
          ? { isActive: input.activeOnly }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        position: true,
        identificationNumber: true,
        // Incluimos solo la información necesaria del rol
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      // Ordenamos alfabéticamente para una mejor experiencia de usuario
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return {
      users,
    };
  });
