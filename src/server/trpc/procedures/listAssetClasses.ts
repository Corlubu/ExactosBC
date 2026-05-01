import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listAssetClasses = baseProcedure
  .input(
    z.object({
      assetTypeId: z.number().optional(),
    }),
  )
  .query(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    const assetClasses = await db.assetClass.findMany({
      where: {
        companyId: auth.companyId,
        ...(input.assetTypeId ? { assetTypeId: input.assetTypeId } : {}),
      },
      include: {
        assetType: true,
        _count: {
          select: {
            assetSubclasses: true,
            assets: true,
          },
        },
      },
      orderBy: [{ assetTypeId: "asc" }, { code: "asc" }],
    });

    return {
      assetClasses: assetClasses.map((assetClass) => ({
        id: assetClass.id,
        assetTypeId: assetClass.assetTypeId,
        code: assetClass.code,
        description: assetClass.description,
        accountingAccount: assetClass.accountingAccount,
        budgetCode: assetClass.budgetCode,
        assetType: {
          id: assetClass.assetType.id,
          name: assetClass.assetType.name,
          code: assetClass.assetType.code,
        },
        subclassCount: assetClass._count.assetSubclasses,
        assetCount: assetClass._count.assets,
      })),
    };
  });
