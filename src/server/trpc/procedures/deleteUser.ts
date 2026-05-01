import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";

export const deleteUser = baseProcedure
  .input(
    z.object({
      userId: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.users");

    // Prevent users from deleting themselves
    if (input.userId === auth.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot delete your own account",
      });
    }

    // Get existing user
    const user = await db.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.companyId !== auth.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only delete users in your company",
      });
    }

    // Soft delete by setting isActive to false
    await db.user.update({
      where: { id: input.userId },
      data: { isActive: false },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "DELETE",
      entityType: "USER",
      entityId: user.id,
      oldValues: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
      newValues: {
        isActive: false,
      },
    });

    return {
      success: true,
    };
  });
