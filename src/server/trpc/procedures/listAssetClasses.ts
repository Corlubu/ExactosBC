import { z } from "zod";
import { protectedProcedureWithPermission } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listAssetClasses = protectedProcedureWithPermission(
  "settings.view",
)
  .input(
    z.object({
      assetTypeId: z.number().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const assetClasses = await db.assetClass.findMany({
      where: {
        companyId: ctx.companyId,
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
