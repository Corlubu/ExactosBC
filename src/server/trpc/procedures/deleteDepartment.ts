import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteDepartment = baseProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Check if department exists and belongs to the company
    const existingDepartment = await db.department.findFirst({
      where: {
        id: input.id,
        companyId: auth.companyId,
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
      userId: auth.user.id,
      companyId: auth.companyId,
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
