import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const markAlertAsRead = protectedProcedure
  .input(
    z.object({
      alertId: z.number(),
      status: z.enum(["ACKNOWLEDGED", "DISMISSED"]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Verify the alert exists and belongs to the user's company
    const existing = await db.assetAlert.findUnique({
      where: { id: input.alertId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Alert not found",
      });
    }

    if (existing.companyId !== ctx.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to update this alert",
      });
    }

    const alert = await db.assetAlert.update({
      where: { id: input.alertId },
      data: {
        status: input.status,
        acknowledgedAt: new Date(),
      },
    });

    return alert;
  });
