import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const getDashboardStats = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    // Get total assets and value
    const assets = await db.asset.findMany({
      where: {
        companyId: auth.companyId,
      },
      select: {
        status: true,
        category: true,
        currentValue: true,
        acquisitionCost: true,
      },
    });

    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalAcquisitionCost = assets.reduce((sum, asset) => sum + asset.acquisitionCost, 0);

    // Group by status
    const assetsByStatus = assets.reduce((acc: Record<string, number>, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {});

    // Group by category
    const assetsByCategory = assets.reduce((acc: Record<string, number>, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {});

    // Get recent audit logs
    const recentActivity = await db.auditLog.findMany({
      where: {
        companyId: auth.companyId,
      },
      include: {
        user: true,
        asset: true,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 10,
    });

    // Get upcoming maintenance
    const upcomingMaintenance = await db.maintenanceRecord.findMany({
      where: {
        companyId: auth.companyId,
        nextDueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
      include: {
        asset: true,
      },
      orderBy: {
        nextDueDate: "asc",
      },
      take: 10,
    });

    return {
      totalAssets,
      totalValue,
      totalAcquisitionCost,
      totalDepreciation: totalAcquisitionCost - totalValue,
      assetsByStatus,
      assetsByCategory,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        timestamp: log.timestamp,
        user: {
          firstName: log.user.firstName,
          lastName: log.user.lastName,
        },
        asset: log.asset
          ? {
              id: log.asset.id,
              name: log.asset.name,
              assetTag: log.asset.assetTag,
            }
          : null,
      })),
      upcomingMaintenance: upcomingMaintenance.map((record) => ({
        id: record.id,
        type: record.type,
        description: record.description,
        nextDueDate: record.nextDueDate,
        asset: {
          id: record.asset.id,
          name: record.asset.name,
          assetTag: record.asset.assetTag,
        },
      })),
    };
  });
