import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";

export const createRole = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      name: z.string().min(1, "Role name is required"),
      description: z.string().optional(),
      permissionIds: z.array(z.number()),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.roles");

    // Check if role with this name already exists in the company
    const existingRole = await db.role.findUnique({
      where: {
        name_companyId: {
          name: input.name,
          companyId: auth.companyId,
        },
      },
    });

    if (existingRole) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A role with this name already exists in your company",
      });
    }

    // Verify all permission IDs are valid
    if (input.permissionIds.length > 0) {
      const permissions = await db.permission.findMany({
        where: {
          id: { in: input.permissionIds },
        },
      });

      if (permissions.length !== input.permissionIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more invalid permission IDs",
        });
      }
    }

    // Create role with permissions
    const role = await db.role.create({
      data: {
        name: input.name,
        description: input.description,
        companyId: auth.companyId,
        permissions: {
          create: input.permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "CREATE",
      entityType: "ROLE",
      entityId: role.id,
      newValues: {
        name: role.name,
        description: role.description,
        permissionIds: input.permissionIds,
      },
    });

    return {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((rp) => rp.permission),
      },
    };
  });
