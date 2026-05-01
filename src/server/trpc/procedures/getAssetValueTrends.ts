import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const getAssetValueTrends = baseProcedure
  .input(
    z.object({
      months: z.number().min(1).max(36).default(12), // Last N months
    }),
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - input.months);

    // Get all assets with their depreciation history
    const assets = await db.asset.findMany({
      where: {
        companyId: auth.companyId,
      },
      include: {
        depreciationCalculations: {
          where: {
            calculationDate: {
              gte: startDate,
            },
          },
          orderBy: {
            calculationDate: "asc",
          },
        },
      },
    });

    // Build time series data by month
    const monthlyValues: Record<
      string,
      {
        month: string;
        totalBookValue: number;
        totalAcquisitionCost: number;
        totalDepreciation: number;
        assetCount: number;
        byCategory: Record<string, number>;
      }
    > = {};

    // Initialize months
    for (let i = 0; i < input.months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      monthlyValues[monthKey] = {
        month: monthKey,
        totalBookValue: 0,
        totalAcquisitionCost: 0,
        totalDepreciation: 0,
        assetCount: 0,
        byCategory: {},
      };
    }

    // Aggregate depreciation calculations by month
    assets.forEach((asset) => {
      // Group this asset's calculations by month
      const calcsByMonth = asset.depreciationCalculations.reduce(
        (acc, calc) => {
          const monthKey = calc.calculationDate.toISOString().substring(0, 7);
          if (monthlyValues[monthKey]) {
            if (!acc[monthKey]) {
              acc[monthKey] = calc;
            }
          }
          return acc;
        },
        {} as Record<string, (typeof asset.depreciationCalculations)[0]>,
      );

      // Add to monthly totals
      Object.entries(calcsByMonth).forEach(([monthKey, calc]) => {
        if (monthlyValues[monthKey]) {
          monthlyValues[monthKey].totalBookValue += calc.bookValue;
          monthlyValues[monthKey].totalAcquisitionCost += asset.acquisitionCost;
          monthlyValues[monthKey].totalDepreciation +=
            calc.accumulatedDepreciation;
          monthlyValues[monthKey].assetCount += 1;

          if (!monthlyValues[monthKey].byCategory[asset.category]) {
            monthlyValues[monthKey].byCategory[asset.category] = 0;
          }
          monthlyValues[monthKey].byCategory[asset.category] += calc.bookValue;
        }
      });
    });

    // Convert to array and sort by date
    const trends = Object.values(monthlyValues)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((data) => ({
        month: data.month,
        totalBookValue: data.totalBookValue,
        totalAcquisitionCost: data.totalAcquisitionCost,
        totalDepreciation: data.totalDepreciation,
        assetCount: data.assetCount,
        categories: Object.entries(data.byCategory).map(([name, value]) => ({
          name,
          value,
        })),
      }));

    // Calculate current snapshot
    const currentSnapshot = {
      totalAssets: assets.length,
      totalCurrentValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
      totalAcquisitionCost: assets.reduce(
        (sum, a) => sum + a.acquisitionCost,
        0,
      ),
      totalDepreciation: assets.reduce(
        (sum, a) => sum + (a.acquisitionCost - a.currentValue),
        0,
      ),
      byCategory: assets.reduce(
        (acc, asset) => {
          if (!acc[asset.category]) {
            acc[asset.category] = {
              count: 0,
              currentValue: 0,
              acquisitionCost: 0,
            };
          }
          acc[asset.category].count += 1;
          acc[asset.category].currentValue += asset.currentValue;
          acc[asset.category].acquisitionCost += asset.acquisitionCost;
          return acc;
        },
        {} as Record<
          string,
          { count: number; currentValue: number; acquisitionCost: number }
        >,
      ),
    };

    return {
      trends,
      currentSnapshot,
    };
  });
