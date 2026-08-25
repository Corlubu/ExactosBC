import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getAssetsByCustodian = protectedProcedure
  .input(
    z.object({
      custodianId: z.number(),
    }),
  )
  .query(async ({ ctx, input }) => {
    // Verify the custodian belongs to the same company
    const custodian = await db.user.findFirst({
      where: {
        id: input.custodianId,
        companyId: ctx.companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        identificationNumber: true,
      },
    });

    if (!custodian) {
      throw new Error("Custodian not found");
    }

    // Get all active assignments for this custodian
    const assignments = await db.assetAssignment.findMany({
      where: {
        userId: input.custodianId,
        endDate: null, // Only active assignments
        asset: {
          companyId: ctx.companyId,
        },
      },
      include: {
        asset: {
          include: {
            location: true,
            branch: true,
            department: true,
            assetType: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return {
      custodian,
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        startDate: assignment.startDate,
        briefDescription: assignment.briefDescription,
        fixedAssetCode: assignment.fixedAssetCode,
        initialCondition: assignment.initialCondition,
        maintenanceObligations: assignment.maintenanceObligations,
        notes: assignment.notes,
        asset: {
          id: assignment.asset.id,
          assetTag: assignment.asset.assetTag,
          name: assignment.asset.name,
          description: assignment.asset.description,
          category: assignment.asset.category,
          status: assignment.asset.status,
          serialNumber: assignment.asset.serialNumber,
          manufacturer: assignment.asset.manufacturer,
          model: assignment.asset.model,
          acquisitionCost: assignment.asset.acquisitionCost,
          currentValue: assignment.asset.currentValue,
          location: assignment.asset.location,
          branch: assignment.asset.branch,
          department: assignment.asset.department,
          assetType: assignment.asset.assetType,
        },
      })),
    };
  });
