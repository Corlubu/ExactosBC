// src/server/trpc/procedures/listAssets.ts
import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listAssets = protectedProcedure
  .input(
    z.object({
      // ELIMINADO: authToken: z.string()
      cursor: z.number().optional(),
      limit: z.number().min(1).max(100).default(50),
      status: z.string().optional(),
      category: z.string().optional(),
      locationId: z.number().optional(),
      branchId: z.number().optional(),
      departmentId: z.number().optional(),
      assetTypeId: z.number().optional(),
      assignedToUserId: z.number().optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    // Usamos directamente el companyId asegurado por el middleware
    const { companyId } = ctx;

    const where: any = {
      companyId: companyId,
    };

    if (input.status) where.status = input.status;
    if (input.category) where.category = input.category;
    if (input.locationId) where.locationId = input.locationId;
    if (input.branchId) where.branchId = input.branchId;
    if (input.departmentId) where.departmentId = input.departmentId;
    if (input.assetTypeId) where.assetTypeId = input.assetTypeId;
    if (input.assignedToUserId) where.assignedToUserId = input.assignedToUserId;

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { assetTag: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const assets = await db.asset.findMany({
      where,
      include: {
        location: true,
        branch: true,
        department: { include: { branch: true } },
        assetType: true,
        enteredBy: { select: { id: true, firstName: true, lastName: true } },
        assignments: {
          where: { endDate: null },
          include: { user: true },
          take: 1,
        },
      },
      orderBy: { id: "desc" },
      take: input.limit + 1,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    });

    let nextCursor: number | undefined = undefined;
    if (assets.length > input.limit) {
      const nextItem = assets.pop();
      nextCursor = nextItem?.id;
    }

    return {
      assets: assets.map((asset) => ({
        id: asset.id,
        assetTag: asset.assetTag,
        name: asset.name,
        description: asset.description,
        category: asset.category,
        status: asset.status,
        acquisitionCost: asset.acquisitionCost,
        currentValue: asset.currentValue,
        acquisitionDate: asset.acquisitionDate,
        photoUrl: asset.photoUrl,
        location: asset.location
          ? { id: asset.location.id, name: asset.location.name }
          : null,
        branch: asset.branch
          ? {
              id: asset.branch.id,
              name: asset.branch.name,
              code: asset.branch.code,
            }
          : null,
        department: asset.department
          ? {
              id: asset.department.id,
              name: asset.department.name,
              code: asset.department.code,
              branch: {
                id: asset.department.branch.id,
                name: asset.department.branch.name,
                code: asset.department.branch.code,
              },
            }
          : null,
        assetType: asset.assetType
          ? {
              id: asset.assetType.id,
              name: asset.assetType.name,
              code: asset.assetType.code,
            }
          : null,
        enteredBy: asset.enteredBy
          ? {
              id: asset.enteredBy.id,
              firstName: asset.enteredBy.firstName,
              lastName: asset.enteredBy.lastName,
            }
          : null,
        currentAssignment: asset.assignments[0]
          ? {
              user: {
                id: asset.assignments[0].user.id,
                firstName: asset.assignments[0].user.firstName,
                lastName: asset.assignments[0].user.lastName,
              },
              startDate: asset.assignments[0].startDate,
            }
          : null,
      })),
      nextCursor,
    };
  });
