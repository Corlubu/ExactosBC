import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateAssetSubclass = baseProcedure
  .input(
    z.object({
      id: z.number(),
      classId: z.number(),
      description: z.string().min(1, "Description is required"),
      abbreviation: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Check if asset subclass exists and belongs to the company
    const existingAssetSubclass = await db.assetSubclass.findFirst({
      where: {
        id: input.id,
        companyId: auth.companyId,
      },
    });

    if (!existingAssetSubclass) {
      throw new Error("Asset subclass not found");
    }

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

    const assetSubclass = await db.assetSubclass.update({
      where: { id: input.id },
      data: {
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
      action: "UPDATE",
      entityType: "ASSET_SUBCLASS",
      entityId: assetSubclass.id,
      oldValues: {
        classId: existingAssetSubclass.classId,
        description: existingAssetSubclass.description,
        abbreviation: existingAssetSubclass.abbreviation,
      },
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
