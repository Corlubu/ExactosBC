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

export async function verifyAuthToken(authToken: string): Promise<TokenPayload> {
  try {
    const verified = jwt.verify(authToken, env.JWT_SECRET);
    const parsed = tokenPayloadSchema.parse(verified);
    return parsed;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired authentication token",
    });
  }
}

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
    permissions: user.role?.permissions.map(rp => rp.permission.name) ?? [],
  };
}

export async function requirePermission(
  authToken: string,
  requiredPermission: string
) {
  const auth = await authenticateRequest(authToken);
  
  if (!auth.permissions.includes(requiredPermission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Permission denied: ${requiredPermission} required`,
    });
  }
  
  return auth;
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
