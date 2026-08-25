import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteBranch = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if branch exists and belongs to the company
    const existingBranch = await db.branch.findFirst({
      where: {
        id: input.id,
        companyId: ctx.companyId,
      },
      include: {
        _count: {
          select: {
            departments: true,
            assets: true,
          },
        },
      },
    });

    if (!existingBranch) {
      throw new Error("Branch not found");
    }

    // Check if branch has departments or assets
    if (existingBranch._count.departments > 0) {
      throw new Error(
        "Cannot delete branch with existing departments. Please delete or reassign departments first.",
      );
    }

    if (existingBranch._count.assets > 0) {
      throw new Error(
        "Cannot delete branch with existing assets. Please delete or reassign assets first.",
      );
    }

    await db.branch.delete({
      where: { id: input.id },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "DELETE",
      entityType: "BRANCH",
      entityId: input.id,
      oldValues: {
        name: existingBranch.name,
        code: existingBranch.code,
      },
    });

    return { success: true };
  });
