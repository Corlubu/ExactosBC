import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteDepartment = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if department exists and belongs to the company
    const existingDepartment = await db.department.findFirst({
      where: {
        id: input.id,
        companyId: ctx.companyId,
      },
      include: {
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });

    if (!existingDepartment) {
      throw new Error("Department not found");
    }

    // Check if department has assets
    if (existingDepartment._count.assets > 0) {
      throw new Error(
        "Cannot delete department with existing assets. Please delete or reassign assets first.",
      );
    }

    await db.department.delete({
      where: { id: input.id },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "DELETE",
      entityType: "DEPARTMENT",
      entityId: input.id,
      oldValues: {
        name: existingDepartment.name,
        code: existingDepartment.code,
        branchId: existingDepartment.branchId,
      },
    });

    return { success: true };
  });
