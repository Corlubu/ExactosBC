import { protectedProcedure } from "~/server/trpc/main";

export const getCurrentUser = protectedProcedure.query(({ ctx }) => {
  // Si la petición viene del servidor (SSR) o el token no es válido,
  // ctx.user estará vacío. En lugar de fallar, devolvemos null pacíficamente.
  if (!ctx.user) {
    return null;
  }

  // Si llegamos aquí, el middleware ya validó el token exitosamente
  return {
    id: ctx.user.id,
    email: ctx.user.email,
    firstName: ctx.user.firstName,
    lastName: ctx.user.lastName,
    companyId: ctx.user.companyId,
    companyName: ctx.user.company.name,
    role: ctx.user.role
      ? {
          id: ctx.user.role.id,
          name: ctx.user.role.name,
          description: ctx.user.role.description,
        }
      : null,
    permissions: ctx.permissions,
  };
});
