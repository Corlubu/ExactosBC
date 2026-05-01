import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createAssetSubclass = baseProcedure
  .input(
    z.object({
      classId: z.number(),
      description: z.string().min(1, "Description is required"),
      abbreviation: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Verify asset class exists and belongs to company
    const assetClass = await db.assetClass.findFirst({
      where: {
        id: input.classId,
        companyId: auth.companyId,
      },
      include: {
        assetType: true,
      },
    });

    if (!assetClass) {
      throw new Error("Asset class not found");
    }

    const assetSubclass = await db.assetSubclass.create({
      data: {
        companyId: auth.companyId,
        classId: input.classId,
        description: input.description,
        abbreviation: input.abbreviation,
      },
      include: {
        class: {
          include: {
            assetType: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "CREATE",
      entityType: "ASSET_SUBCLASS",
      entityId: assetSubclass.id,
      newValues: {
        classId: assetSubclass.classId,
        description: assetSubclass.description,
        abbreviation: assetSubclass.abbreviation,
      },
    });

    return {
      id: assetSubclass.id,
      classId: assetSubclass.classId,
      description: assetSubclass.description,
      abbreviation: assetSubclass.abbreviation,
      class: {
        id: assetSubclass.class.id,
        code: assetSubclass.class.code,
        description: assetSubclass.class.description,
        assetType: {
          id: assetSubclass.class.assetType.id,
          name: assetSubclass.class.assetType.name,
          code: assetSubclass.class.assetType.code,
        },
      },
    };
  });
