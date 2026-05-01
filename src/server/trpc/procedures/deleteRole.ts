import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";

export const deleteRole = baseProcedure
  .input(
    z.object({
      oleId: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.roles");

    // Get existing role
    const role = await db.role.findUnique({
      where: { id: input.roleId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Role not found",
      });
    }

    if (role.companyId !== auth.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only delete roles in your company",
      });
    }

    // Check if any users are assigned to this role
    if (role._count.users > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot delete role: ${role._count.users} user(s) are currently assigned to this role. Please reassign them first.`,
      });
    }

    // Delete role (cascade will delete RolePermission entries)
    await db.role.delete({
      where: { id: input.roleId },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "DELETE",
      entityType: "ROLE",
      entityId: role.id,
      oldValues: {
        name: role.name,
        description: role.description,
      },
    });

    return {
      success: true,
    };
  });
