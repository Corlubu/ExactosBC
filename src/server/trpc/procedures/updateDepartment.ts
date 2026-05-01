import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateDepartment = baseProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(1, "Department name is required"),
      code: z.string().min(1, "Department code is required"),
      branchId: z.number(),
      departmentHeadId: z.number().optional().nullable(),
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
    });

    if (!existingDepartment) {
      throw new Error("Department not found");
    }

    // Check if branch exists and belongs to the company
    const branch = await db.branch.findFirst({
      where: {
        id: input.branchId,
        companyId: auth.companyId,
      },
    });

    if (!branch) {
      throw new Error("Branch not found");
    }

    // Verify department head exists and belongs to company (if provided)
    if (input.departmentHeadId) {
      const departmentHead = await db.user.findFirst({
        where: {
          id: input.departmentHeadId,
          companyId: auth.companyId,
        },
      });

      if (!departmentHead) {
        throw new Error("Department head not found");
      }
    }

    // Check if the new code conflicts with another department in the same branch
    if (
      input.code !== existingDepartment.code ||
      input.branchId !== existingDepartment.branchId
    ) {
      const codeConflict = await db.department.findFirst({
        where: {
          code: input.code,
          branchId: input.branchId,
          id: { not: input.id },
        },
      });

      if (codeConflict) {
        throw new Error(
          "A department with this code already exists in this branch",
        );
      }
    }

    const department = await db.department.update({
      where: { id: input.id },
      data: {
        name: input.name,
        code: input.code,
        branchId: input.branchId,
        departmentHeadId: input.departmentHeadId,
      },
      include: {
        branch: true,
        departmentHead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "DEPARTMENT",
      entityId: department.id,
      oldValues: {
        name: existingDepartment.name,
        code: existingDepartment.code,
        branchId: existingDepartment.branchId,
        departmentHeadId: existingDepartment.departmentHeadId,
      },
      newValues: {
        name: department.name,
        code: department.code,
        branchId: department.branchId,
        departmentHeadId: department.departmentHeadId,
      },
    });

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      branchId: department.branchId,
      departmentHeadId: department.departmentHeadId,
      branch: {
        id: department.branch.id,
        name: department.branch.name,
        code: department.branch.code,
      },
      departmentHead: department.departmentHead,
    };
  });
