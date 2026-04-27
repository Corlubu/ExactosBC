import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const deleteBranch = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      id: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Check if branch exists and belongs to the company
    const existingBranch = await db.branch.findFirst({
      where: {
        id: input.id,
        companyId: auth.companyId,
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
      throw new Error("Cannot delete branch with existing departments. Please delete or reassign departments first.");
    }

    if (existingBranch._count.assets > 0) {
      throw new Error("Cannot delete branch with existing assets. Please delete or reassign assets first.");
    }

    await db.branch.delete({
      where: { id: input.id },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
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
