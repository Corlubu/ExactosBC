import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listAlertSettings = protectedProcedure
  .input(
    z.object({
      alertType: z
        .enum([
          "DEPRECIATION_MILESTONE",
          "BOOK_VALUE_THRESHOLD",
          "FULLY_DEPRECIATED",
        ])
        .optional(),
      isEnabled: z.boolean().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const where: {
      companyId: number;
      alertType?: string;
      isEnabled?: boolean;
    } = {
      companyId: ctx.companyId,
    };

    if (input.alertType) {
      where.alertType = input.alertType;
    }

    if (input.isEnabled !== undefined) {
      where.isEnabled = input.isEnabled;
    }

    const alertSettings = await db.alertSetting.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return alertSettings;
  });
