import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const deleteAlertSetting = baseProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

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

    if (existing.companyId !== auth.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to delete this alert setting",
      });
    }

    await db.alertSetting.delete({
      where: { id: input.id },
    });

    return { success: true };
  });
