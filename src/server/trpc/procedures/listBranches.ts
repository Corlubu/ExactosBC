import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listBranches = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const branches = await db.branch.findMany({
      where: {
        companyId: auth.companyId,
      },
      orderBy: {
        code: "asc",
      },
      include: {
        _count: {
          select: {
            departments: true,
            assets: true,
          },
        },
      },
    });

    return {
      branches: branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        address: branch.address,
        qrCodeUrl: branch.qrCodeUrl,
        departmentCount: branch._count.departments,
        assetCount: branch._count.assets,
      })),
    };
  });
