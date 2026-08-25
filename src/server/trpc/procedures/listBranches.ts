import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listBranches = protectedProcedure
  .input(z.object({}).optional())
  .query(async ({ ctx, input }) => {
    const branches = await db.branch.findMany({
      where: {
        companyId: ctx.companyId,
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
