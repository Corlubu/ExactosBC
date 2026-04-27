import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";

export const getCurrentUser = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

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
