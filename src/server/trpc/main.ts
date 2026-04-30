import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
// IMPORTANTE: Importamos tu función real de autenticación
import { authenticateRequest } from "~/server/utils/auth";

/**
 * 1. DEFINICIÓN DEL CONTEXTO (CONTEXT)
 * Extrae el token de forma universal y valida la identidad contra la BDD.
 */
export const createTRPCContext = async (opts: { req: any; res: any }) => {
  let authHeader: string | null | undefined = null;

  // Extracción universal de Headers (Soporta Vinxi, h3, Node)
  if (opts?.req) {
    if (opts.req.headers instanceof Headers) {
      authHeader = opts.req.headers.get("authorization");
    } else if (opts.req.headers?.authorization) {
      authHeader = opts.req.headers.authorization;
    } else if (typeof opts.req.headers?.get === "function") {
      authHeader = opts.req.headers.get("authorization");
    }
  }

  // Limpieza del token (elimina "Bearer " si existe)
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  let user = null;
  let companyId = null;

  // Validación real contra la base de datos
  if (token && token.length > 20 && token !== "null" && token !== "undefined") {
    try {
      // Llamamos a tu función de utilidad
      const authData = await authenticateRequest(token);

      // LOG DE DEPURACIÓN (Míralo en la terminal del backend)
      console.log("🔍 DEBUG AUTH:", {
        found: !!authData?.user,
        userId: authData?.user?.id,
        companyId: authData?.companyId,
      });

      // Asignación segura
      if (authData && authData.user) {
        user = authData.user;
        companyId = authData.companyId || authData.user.companyId;
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
 * 3. MIDDLEWARES DE SEGURIDAD
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  // Verificación estricta de identidad
  if (!ctx.user) {
    console.error(
      "🚫 ACCESO DENEGADO: Middleware bloqueó la petición porque ctx.user es NULL",
    );
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuario no encontrado",
    });
  }

  if (!ctx.companyId) {
    console.error(
      "🚫 ACCESO DENEGADO: Middleware bloqueó la petición porque ctx.companyId es NULL",
    );
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Empresa no identificada",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
      companyId: ctx.companyId,
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
