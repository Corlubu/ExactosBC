import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const getAssetDistribution = baseProcedure
  .input(z.object({}))
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    // Get all assets for the company
    const assets = await db.asset.findMany({
      where: {
        companyId: auth.companyId,
      },
      select: {
        id: true,
        category: true,
        status: true,
        currentValue: true,
        acquisitionCost: true,
        locationId: true,
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group by category
    const byCategory = assets.reduce(
      (
        acc: Record<
          string,
          { count: number; value: number; acquisitionCost: number }
        >,
        asset,
      ) => {
        if (!acc[asset.category]) {
          acc[asset.category] = { count: 0, value: 0, acquisitionCost: 0 };
        }
        acc[asset.category].count += 1;
        acc[asset.category].value += asset.currentValue;
        acc[asset.category].acquisitionCost += asset.acquisitionCost;
        return acc;
      },
      {},
    );

    // Group by status
    const byStatus = assets.reduce(
      (acc: Record<string, { count: number; value: number }>, asset) => {
        if (!acc[asset.status]) {
          acc[asset.status] = { count: 0, value: 0 };
        }
        acc[asset.status].count += 1;
        acc[asset.status].value += asset.currentValue;
        return acc;
      },
      {},
    );

    // Group by location
    const byLocation = assets.reduce(
      (
        acc: Record<
          string,
          { count: number; value: number; locationId: number | null }
        >,
        asset,
      ) => {
        const locationKey = asset.location?.name || "Unassigned";
        if (!acc[locationKey]) {
          acc[locationKey] = {
            count: 0,
            value: 0,
            locationId: asset.locationId,
          };
        }
        acc[locationKey].count += 1;
        acc[locationKey].value += asset.currentValue;
        return acc;
      },
      {},
    );

    // Convert to arrays and sort
    const categoryData = Object.entries(byCategory)
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value,
        acquisitionCost: data.acquisitionCost,
        depreciation: data.acquisitionCost - data.value,
      }))
      .sort((a, b) => b.value - a.value);

    const statusData = Object.entries(byStatus)
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => b.count - a.count);

    const locationData = Object.entries(byLocation)
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value,
        locationId: data.locationId,
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate totals
    const totalAssets = assets.length;
    const totalValue = assets.reduce(
      (sum, asset) => sum + asset.currentValue,
      0,
    );
    const totalAcquisitionCost = assets.reduce(
      (sum, asset) => sum + asset.acquisitionCost,
      0,
    );
    const totalDepreciation = totalAcquisitionCost - totalValue;

    return {
      byCategory: categoryData,
      byStatus: statusData,
      byLocation: locationData,
      totals: {
        assets: totalAssets,
        value: totalValue,
        acquisitionCost: totalAcquisitionCost,
        depreciation: totalDepreciation,
      },
    };
  });
