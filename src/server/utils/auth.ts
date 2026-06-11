import jwt from "jsonwebtoken";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { env } from "~/server/env";

const tokenPayloadSchema = z.object({
  userId: z.number(),
  companyId: z.number(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

export async function verifyAuthToken(
  authToken: string,
): Promise<TokenPayload> {
  try {
    const verified = jwt.verify(authToken, env.JWT_SECRET);
    return tokenPayloadSchema.parse(verified);
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired authentication token",
    });
  }
}

/**
 * Función principal de autenticación.
 * Carga el usuario y TODOS sus permisos en una sola consulta estructurada.
 */
export async function authenticateRequest(authToken: string) {
  const payload = await verifyAuthToken(authToken);

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      company: true,
    },
  });

  if (!user || !user.isActive) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found or inactive",
    });
  }

  if (user.companyId !== payload.companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Company mismatch",
    });
  }

  return {
    user,
    companyId: payload.companyId,
    // Extraemos un arreglo plano de strings con los nombres de los permisos
    permissions: user.role?.permissions.map((rp) => rp.permission.name) ?? [],
  };
}

export async function createAuditLog(params: {
  userId: number;
  companyId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  assetId?: number;
  ipAddress?: string;
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      companyId: params.companyId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      assetId: params.assetId,
      ipAddress: params.ipAddress,
    },
  });
}
/**
 * Verifica el token y comprueba si el usuario tiene un permiso específico.
 */
export async function requirePermission(
  authToken: string,
  requiredPermission: string,
) {
  // 1. Autenticar al usuario y obtener sus permisos
  const auth = await authenticateRequest(authToken);

  // 2. Verificar si el permiso requerido está en su lista de permisos
  if (!auth.permissions.includes(requiredPermission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Access denied. Missing required permission: ${requiredPermission}`,
    });
  }

  // 3. Retornar el objeto auth (que contiene user, companyId, y permissions)
  // para que pueda ser usado en los procedimientos de tRPC
  return auth;
}
