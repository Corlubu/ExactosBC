import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listAssetSubclasses = protectedProcedure
  .input(
    z.object({
      classId: z.number().optional(),
    }),
  )
  .query(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    const assetSubclasses = await db.assetSubclass.findMany({
      where: {
        companyId: ctx.companyId,
        ...(input.classId ? { classId: input.classId } : {}),
      },
      include: {
        class: {
          include: {
            assetType: true,
          },
        },
        _count: {
          select: {
            assets: true,
          },
        },
      },
      orderBy: [{ classId: "asc" }, { description: "asc" }],
    });

    return {
      assetSubclasses: assetSubclasses.map((subclass) => ({
        id: subclass.id,
        classId: subclass.classId,
        description: subclass.description,
        abbreviation: subclass.abbreviation,
        class: {
          id: subclass.class.id,
          code: subclass.class.code,
          description: subclass.class.description,
          assetType: {
            id: subclass.class.assetType.id,
            name: subclass.class.assetType.name,
            code: subclass.class.assetType.code,
          },
        },
        assetCount: subclass._count.assets,
      })),
    };
  });
