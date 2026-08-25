import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { authenticateRequest } from "~/server/utils/auth";

/**
 * 1. DEFINICIÓN DEL CONTEXTO (CONTEXT)
 * Extrae el token de forma universal y valida la identidad contra la BDD (Una sola vez por request).
 */
export const createTRPCContext = async (opts: { req: any; res: any }) => {
  let authHeader: string | null | undefined = null;

  if (opts?.req) {
    if (opts.req.headers instanceof Headers) {
      authHeader = opts.req.headers.get("authorization");
    } else if (opts.req.headers?.authorization) {
      authHeader = opts.req.headers.authorization;
    } else if (typeof opts.req.headers?.get === "function") {
      authHeader = opts.req.headers.get("authorization");
    }
  }

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  let user = null;
  let companyId = null;
  let permissions: string[] = [];

  if (token && token.length > 20 && token !== "null" && token !== "undefined") {
    try {
      const authData = await authenticateRequest(token);
      if (authData && authData.user) {
        user = authData.user;
        companyId = authData.companyId || authData.user.companyId;
        permissions = authData.permissions; // Guardamos en memoria los permisos
      }
    } catch (cause) {
      console.error("❌ Fallo crítico en authenticateRequest:", cause);
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    companyId,
    permissions,
    token,
  };
};

/**
 * 2. INICIALIZACIÓN DE tRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. MIDDLEWARES DE SEGURIDAD BASE
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuario no encontrado o Empresa no identificada",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
      companyId: ctx.companyId,
      permissions: ctx.permissions,
    },
  });
});

/**
 * 4. EXPORTACIÓN DE RUTAS Y PROCEDIMIENTOS
 */
export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const createCallerFactory = t.createCallerFactory;

/**
 * NUEVO: FABRICANTE DE PROCEDIMIENTOS CON PERMISOS
 * Esto evita repetir la lógica y pegarle a la BD en cada endpoint individual.
 */
export const protectedProcedureWithPermission = (
  requiredPermission: string,
) => {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.permissions.includes(requiredPermission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Acceso denegado. Se requiere el permiso: ${requiredPermission}`,
      });
    }
    return next({ ctx });
  });
};
