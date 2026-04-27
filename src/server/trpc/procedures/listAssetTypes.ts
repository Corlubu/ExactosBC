import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listAssetTypes = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const assetTypes = await db.assetType.findMany({
      where: {
        companyId: auth.companyId,
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
