import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const updateAlertSetting = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      isEnabled: z.boolean().optional(),
      thresholdPercentage: z.number().min(0).max(100).optional(),
      thresholdAmount: z.number().min(0).optional(),
      assetCategory: z.string().optional().nullable(),
      notifyUsers: z.boolean().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Verify the alert setting exists and belongs to the user's company
    const existing = await db.alertSetting.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Alert setting not found",
      });
    }

    if (existing.companyId !== ctx.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to update this alert setting",
      });
    }

    const alertSetting = await db.alertSetting.update({
      where: { id: input.id },
      data: {
        name: input.name,
        isEnabled: input.isEnabled,
        thresholdPercentage: input.thresholdPercentage,
        thresholdAmount: input.thresholdAmount,
        assetCategory: input.assetCategory,
        notifyUsers: input.notifyUsers,
      },
    });

    return alertSetting;
  });
