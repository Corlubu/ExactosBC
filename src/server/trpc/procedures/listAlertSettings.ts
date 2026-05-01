import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listAlertSettings = baseProcedure
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
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const where: {
      companyId: number;
      alertType?: string;
      isEnabled?: boolean;
    } = {
      companyId: auth.companyId,
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
