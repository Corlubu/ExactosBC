import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";

export const updateRole = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      roleId: z.number(),
      name: z.string().min(1, "Role name is required").optional(),
      description: z.string().nullable().optional(),
      permissionIds: z.array(z.number()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.roles");

    // Get existing role
    const existingRole = await db.role.findUnique({
      where: { id: input.roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!existingRole) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Role not found",
      });
    }

    if (existingRole.companyId !== auth.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only update roles in your company",
      });
    }

    // Check name uniqueness if name is being changed
    if (input.name && input.name !== existingRole.name) {
      const roleWithName = await db.role.findUnique({
        where: {
          name_companyId: {
            name: input.name,
            companyId: auth.companyId,
          },
        },
      });

      if (roleWithName) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A role with this name already exists in your company",
        });
      }
    }

    // Verify all permission IDs are valid if permissions are being updated
    if (input.permissionIds !== undefined && input.permissionIds.length > 0) {
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

    // Update role and permissions in a transaction
    const updatedRole = await db.$transaction(async (tx) => {
      // Update role details
      const role = await tx.role.update({
        where: { id: input.roleId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
        },
      });

      // Update permissions if provided
      if (input.permissionIds !== undefined) {
        // Delete existing permissions
        await tx.rolePermission.deleteMany({
          where: { roleId: input.roleId },
        });

        // Create new permissions
        if (input.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: input.permissionIds.map((permissionId) => ({
              roleId: input.roleId,
              permissionId,
            })),
          });
        }
      }

      // Fetch updated role with permissions
      return tx.role.findUnique({
        where: { id: input.roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });

    if (!updatedRole) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update role",
      });
    }

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "ROLE",
      entityId: updatedRole.id,
      oldValues: {
        name: existingRole.name,
        description: existingRole.description,
        permissionIds: existingRole.permissions.map((rp) => rp.permissionId),
      },
      newValues: {
        name: updatedRole.name,
        description: updatedRole.description,
        permissionIds: updatedRole.permissions.map((rp) => rp.permissionId),
      },
    });

    return {
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: updatedRole.permissions.map((rp) => rp.permission),
      },
    };
  });
