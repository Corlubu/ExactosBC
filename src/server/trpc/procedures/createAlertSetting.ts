import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createAlertSetting = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      alertType: z.enum([
        "DEPRECIATION_MILESTONE",
        "BOOK_VALUE_THRESHOLD",
        "FULLY_DEPRECIATED",
      ]),
      isEnabled: z.boolean().default(true),
      thresholdPercentage: z.number().min(0).max(100).optional(),
      thresholdAmount: z.number().min(0).optional(),
      assetCategory: z.string().optional(),
      notifyUsers: z.boolean().default(true),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Validate that appropriate threshold is provided for the alert type
    if (
      input.alertType === "DEPRECIATION_MILESTONE" &&
      !input.thresholdPercentage
    ) {
      throw new Error(
        "Threshold percentage is required for depreciation milestone alerts",
      );
    }
    if (input.alertType === "BOOK_VALUE_THRESHOLD" && !input.thresholdAmount) {
      throw new Error(
        "Threshold amount is required for book value threshold alerts",
      );
    }

    const alertSetting = await db.alertSetting.create({
      data: {
        companyId: ctx.companyId,
        name: input.name,
        alertType: input.alertType,
        isEnabled: input.isEnabled,
        thresholdPercentage: input.thresholdPercentage,
        thresholdAmount: input.thresholdAmount,
        assetCategory: input.assetCategory,
        notifyUsers: input.notifyUsers,
      },
    });

    return alertSetting;
  });
