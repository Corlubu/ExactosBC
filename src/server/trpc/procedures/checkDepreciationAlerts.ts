import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const checkDepreciationAlerts = protectedProcedure
  .input(
    z.object({
      assetId: z.number().optional(), // Optional: check only a specific asset
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Get all enabled alert settings for this company
    const alertSettings = await db.alertSetting.findMany({
      where: {
        companyId: ctx.companyId,
        isEnabled: true,
      },
    });

    if (alertSettings.length === 0) {
      return {
        message: "No enabled alert settings found",
        triggeredAlerts: [],
      };
    }

    // Get all active assets with their latest depreciation calculation
    const assetsWhere: {
      companyId: number;
      status: string;
      id?: number;
    } = {
      companyId: ctx.companyId,
      status: "ACTIVE",
    };

    if (input.assetId) {
      assetsWhere.id = input.assetId;
    }

    const assets = await db.asset.findMany({
      where: assetsWhere,
      include: {
        depreciationCalculations: {
          orderBy: {
            calculationDate: "desc",
          },
          take: 1,
        },
      },
    });

    const triggeredAlerts: Array<{
      assetId: number;
      assetName: string;
      alertType: string;
      message: string;
    }> = [];

    // Check each asset against each alert setting
    for (const asset of assets) {
      const latestDepreciation = asset.depreciationCalculations[0];

      // Skip if no depreciation calculation exists yet
      if (!latestDepreciation) {
        continue;
      }

      for (const setting of alertSettings) {
        // Skip if asset category filter doesn't match
        if (setting.assetCategory && setting.assetCategory !== asset.category) {
          continue;
        }

        let shouldTrigger = false;
        let message = "";
        let currentValue = 0;
        let thresholdValue = 0;

        // Check based on alert type
        if (
          setting.alertType === "DEPRECIATION_MILESTONE" &&
          setting.thresholdPercentage
        ) {
          // Calculate depreciation percentage
          const totalDepreciable = asset.acquisitionCost - asset.residualValue;
          const depreciationPercentage =
            totalDepreciable > 0
              ? (latestDepreciation.accumulatedDepreciation /
                  totalDepreciable) *
                100
              : 0;

          currentValue = depreciationPercentage;
          thresholdValue = setting.thresholdPercentage;

          if (depreciationPercentage >= setting.thresholdPercentage) {
            shouldTrigger = true;
            message = `Asset "${asset.name}" has reached ${depreciationPercentage.toFixed(1)}% depreciation (threshold: ${setting.thresholdPercentage}%)`;
          }
        } else if (
          setting.alertType === "BOOK_VALUE_THRESHOLD" &&
          setting.thresholdAmount
        ) {
          currentValue = latestDepreciation.bookValue;
          thresholdValue = setting.thresholdAmount;

          if (latestDepreciation.bookValue < setting.thresholdAmount) {
            shouldTrigger = true;
            message = `Asset "${asset.name}" book value ($${latestDepreciation.bookValue.toFixed(2)}) has fallen below threshold ($${setting.thresholdAmount.toFixed(2)})`;
          }
        } else if (setting.alertType === "FULLY_DEPRECIATED") {
          currentValue = latestDepreciation.bookValue;
          thresholdValue = asset.residualValue;

          // Consider fully depreciated if book value is at or below residual value (with small tolerance)
          if (latestDepreciation.bookValue <= asset.residualValue + 0.01) {
            shouldTrigger = true;
            message = `Asset "${asset.name}" is fully depreciated (book value: $${latestDepreciation.bookValue.toFixed(2)}, residual value: $${asset.residualValue.toFixed(2)})`;
          }
        }

        if (shouldTrigger) {
          // Check if this alert was already triggered for this asset/setting combination
          const existingAlert = await db.assetAlert.findFirst({
            where: {
              assetId: asset.id,
              alertSettingId: setting.id,
              status: "ACTIVE",
            },
          });

          // Only create alert if it hasn't been triggered before or was acknowledged
          if (!existingAlert) {
            await db.assetAlert.create({
              data: {
                companyId: ctx.companyId,
                assetId: asset.id,
                alertSettingId: setting.id,
                alertType: setting.alertType,
                message,
                currentValue,
                thresholdValue,
                status: "ACTIVE",
              },
            });

            triggeredAlerts.push({
              assetId: asset.id,
              assetName: asset.name,
              alertType: setting.alertType,
              message,
            });
          }
        }
      }
    }

    return {
      message: `Checked ${assets.length} assets against ${alertSettings.length} alert settings`,
      triggeredAlerts,
      totalChecked: assets.length,
      totalAlertSettings: alertSettings.length,
    };
  });
