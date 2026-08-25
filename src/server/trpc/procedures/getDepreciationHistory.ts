import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getDepreciationHistory = protectedProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      assetId: z.number().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    // Build where clause
    const where: {
      asset: {
        companyId: number;
        id?: number;
      };
      calculationDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      asset: {
        companyId: ctx.companyId,
      },
    };

    if (input.assetId) {
      where.asset.id = input.assetId;
    }

    if (input.startDate || input.endDate) {
      where.calculationDate = {};
      if (input.startDate) {
        where.calculationDate.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        where.calculationDate.lte = new Date(input.endDate);
      }
    }

    // Get depreciation calculations
    const calculations = await db.depreciationCalculation.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetTag: true,
            category: true,
          },
        },
      },
      orderBy: {
        calculationDate: "asc",
      },
    });

    // Group by month for aggregated view
    const monthlyData = calculations.reduce(
      (
        acc: Record<
          string,
          {
            date: string;
            totalDepreciation: number;
            totalBookValue: number;
            totalAccumulatedDepreciation: number;
            count: number;
          }
        >,
        calc,
      ) => {
        const monthKey = calc.calculationDate.toISOString().substring(0, 7); // YYYY-MM

        if (!acc[monthKey]) {
          acc[monthKey] = {
            date: monthKey,
            totalDepreciation: 0,
            totalBookValue: 0,
            totalAccumulatedDepreciation: 0,
            count: 0,
          };
        }

        acc[monthKey].totalDepreciation += calc.depreciationAmount;
        acc[monthKey].totalBookValue += calc.bookValue;
        acc[monthKey].totalAccumulatedDepreciation +=
          calc.accumulatedDepreciation;
        acc[monthKey].count += 1;

        return acc;
      },
      {},
    );

    // Convert to array and sort by date
    const timeSeriesData = Object.values(monthlyData).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // Get individual asset depreciation trends if filtering by asset
    const assetTrends = input.assetId
      ? calculations.map((calc) => ({
          date: calc.calculationDate,
          assetId: calc.asset.id,
          assetName: calc.asset.name,
          depreciationAmount: calc.depreciationAmount,
          bookValue: calc.bookValue,
          accumulatedDepreciation: calc.accumulatedDepreciation,
          method: calc.method,
        }))
      : [];

    return {
      timeSeries: timeSeriesData,
      assetTrends,
      totalCalculations: calculations.length,
    };
  });
