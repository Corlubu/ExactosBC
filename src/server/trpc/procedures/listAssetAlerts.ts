import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listAssetAlerts = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      status: z.enum(["ACTIVE", "ACKNOWLEDGED", "DISMISSED"]).optional(),
      assetId: z.number().optional(),
      alertType: z.enum(["DEPRECIATION_MILESTONE", "BOOK_VALUE_THRESHOLD", "FULLY_DEPRECIATED"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const where: {
      companyId: number;
      status?: string;
      assetId?: number;
      alertType?: string;
    } = {
      companyId: auth.companyId,
    };

    if (input.status) {
      where.status = input.status;
    }

    if (input.assetId) {
      where.assetId = input.assetId;
    }

    if (input.alertType) {
      where.alertType = input.alertType;
    }

    const alerts = await db.assetAlert.findMany({
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
        alertSetting: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        triggeredAt: "desc",
      },
      take: input.limit,
    });

    // Count active alerts for summary
    const activeCount = await db.assetAlert.count({
      where: {
        companyId: auth.companyId,
        status: "ACTIVE",
      },
    });

    return {
      alerts,
      activeCount,
    };
  });
