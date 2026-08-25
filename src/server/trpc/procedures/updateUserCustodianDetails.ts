import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateUserCustodianDetails = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      position: z.string().optional(),
      identificationNumber: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Verify the user belongs to the same company
    const existingUser = await db.user.findFirst({
      where: {
        id: input.userId,
        companyId: ctx.companyId,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check if identification number is already in use by another user
    if (input.identificationNumber) {
      const duplicateUser = await db.user.findFirst({
        where: {
          identificationNumber: input.identificationNumber,
          companyId: ctx.companyId,
          id: { not: input.userId },
        },
      });

      if (duplicateUser) {
        throw new Error("Identification number is already in use");
      }
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: { id: input.userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        position: input.position,
        identificationNumber: input.identificationNumber,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        identificationNumber: true,
        isActive: true,
      },
    });

    return updatedUser;
  });
