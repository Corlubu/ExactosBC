import { z } from "zod";
import { protectedProcedureWithPermission } from "~/server/trpc/main";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { createAuditLog } from "~/server/utils/auth";

export const updateRole = protectedProcedureWithPermission
  .input(
    z.object({
      roleId: z.number(),
      name: z.string().optional(),
      description: z.string().nullable().optional(),
      permissionIds: z.array(z.number()).optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { companyId, user } = ctx;

    const role = await db.role.findFirst({
      where: { id: input.roleId, companyId: companyId },
    });

    if (!role) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
    }

    if (input.name && input.name !== role.name) {
      const existingRole = await db.role.findFirst({
        where: { name: input.name, companyId: companyId },
      });
      if (existingRole) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A role with this name already exists",
        });
      }
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;

    const updatedRole = await db.$transaction(async (tx) => {
      if (input.permissionIds !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: input.roleId } });
        await tx.rolePermission.createMany({
          data: input.permissionIds.map((id) => ({
            roleId: input.roleId,
            permissionId: id,
          })),
        });
      }

      return tx.role.update({
        where: { id: input.roleId },
        data: updateData,
        include: { permissions: { include: { permission: true } } },
      });
    });

    await createAuditLog({
      userId: user.id,
      companyId: companyId,
      action: "UPDATE",
      entityType: "ROLE",
      entityId: role.id,
      oldValues: { name: role.name, description: role.description },
      newValues: updateData,
    });

    return updatedRole;
  });
