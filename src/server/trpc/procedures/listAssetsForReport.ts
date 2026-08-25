import { z } from "zod";
import { protectedProcedureWithPermission } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listAssetsForReport = protectedProcedureWithPermission(
  "finance.reports",
)
  .input(
    z.object({
      status: z.string().optional(),
      locationId: z.number().optional(),
      branchId: z.number().optional(),
      departmentId: z.number().optional(),
      assetTypeId: z.number().optional(),
      assetClassId: z.number().optional(),
      assignedToUserId: z.number().optional(),
      startDate: z.string().date().optional(),
      endDate: z.string().date().optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const where: {
      companyId: number;
      status?: string;
      locationId?: number;
      branchId?: number;
      departmentId?: number;
      assetTypeId?: number;
      assetClassId?: number;
      assignedToUserId?: number;
      acquisitionDate?: {
        gte?: Date;
        lte?: Date;
      };
      OR?: Array<
        | { name: { contains: string; mode: "insensitive" } }
        | { assetTag: { contains: string; mode: "insensitive" } }
      >;
    } = {
      companyId: ctx.companyId,
    };

    if (input.status) {
      where.status = input.status;
    }

    if (input.locationId) {
      where.locationId = input.locationId;
    }

    if (input.branchId) {
      where.branchId = input.branchId;
    }

    if (input.departmentId) {
      where.departmentId = input.departmentId;
    }

    if (input.assetTypeId) {
      where.assetTypeId = input.assetTypeId;
    }

    if (input.assetClassId) {
      where.assetClassId = input.assetClassId;
    }

    if (input.assignedToUserId) {
      where.assignedToUserId = input.assignedToUserId;
    }

    // Date range filtering
    if (input.startDate || input.endDate) {
      where.acquisitionDate = {};
      if (input.startDate) {
        where.acquisitionDate.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        where.acquisitionDate.lte = new Date(input.endDate);
      }
    }

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
        department: {
          include: {
            branch: true,
          },
        },
        assetType: true,
        assetClass: true,
        assetSubclass: true,
        enteredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignments: {
          where: {
            endDate: null,
          },
          include: {
            user: true,
          },
          take: 1,
        },
      },
      orderBy: {
        acquisitionDate: "desc",
      },
    });

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
        serviceDate: asset.serviceDate,
        photoUrl: asset.photoUrl,
        serialNumber: asset.serialNumber,
        manufacturer: asset.manufacturer,
        model: asset.model,
        supplier: asset.supplier,
        location: asset.location
          ? {
              id: asset.location.id,
              name: asset.location.name,
              type: asset.location.type,
            }
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
        assetClass: asset.assetClass
          ? {
              id: asset.assetClass.id,
              code: asset.assetClass.code,
              description: asset.assetClass.description,
            }
          : null,
        assetSubclass: asset.assetSubclass
          ? {
              id: asset.assetSubclass.id,
              description: asset.assetSubclass.description,
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
    };
  });
