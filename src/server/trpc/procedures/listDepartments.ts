import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listDepartments = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      branchId: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const departments = await db.department.findMany({
      where: {
        companyId: auth.companyId,
        ...(input.branchId ? { branchId: input.branchId } : {}),
      },
      orderBy: [
        { branch: { code: "asc" } },
        { code: "asc" },
      ],
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
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });

    return {
      departments: departments.map((department) => ({
        id: department.id,
        name: department.name,
        code: department.code,
        branchId: department.branchId,
        departmentHeadId: department.departmentHeadId,
        qrCodeUrl: department.qrCodeUrl,
        branch: {
          id: department.branch.id,
          name: department.branch.name,
          code: department.branch.code,
        },
        departmentHead: department.departmentHead,
        assetCount: department._count.assets,
      })),
    };
  });
