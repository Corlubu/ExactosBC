import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { createAuditLog } from "~/server/utils/auth";

export const createRole = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1, "Role name is required"),
      description: z.string().optional(),
      permissionIds: z.array(z.number()),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { companyId, user } = ctx;

    // Check if role name already exists
    const existingRole = await db.role.findFirst({
      where: { name: input.name, companyId: companyId },
    });

    if (existingRole) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A role with this name already exists",
      });
    }

    const role = await db.role.create({
      data: {
        companyId: companyId,
        name: input.name,
        description: input.description,
        permissions: {
          create: input.permissionIds.map((id) => ({
            permissionId: id,
          })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    await createAuditLog({
      userId: user.id,
      companyId: companyId,
      action: "CREATE",
      entityType: "ROLE",
      entityId: role.id,
      newValues: {
        name: role.name,
        description: role.description,
        permissions: input.permissionIds,
      },
    });

    return role;
  });
