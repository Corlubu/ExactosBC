import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listAssetTypes = protectedProcedure
  .input(z.object({}).optional())
  .query(async ({ ctx, input }) => {
    const assetTypes = await db.assetType.findMany({
      where: {
        companyId: ctx.companyId,
      },
      orderBy: {
        code: "asc",
      },
      include: {
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });

    return {
      assetTypes: assetTypes.map((assetType) => ({
        id: assetType.id,
        name: assetType.name,
        code: assetType.code,
        acronym: assetType.acronym,
        isDepreciable: assetType.isDepreciable,
        accountingAccount: assetType.accountingAccount,
        assetCount: assetType._count.assets,
      })),
    };
  });
