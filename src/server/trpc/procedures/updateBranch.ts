import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateBranch = baseProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(1, "Branch name is required"),
      code: z.string().min(1, "Branch code is required"),
      address: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Check if branch exists and belongs to the company
    const existingBranch = await db.branch.findFirst({
      where: {
        id: input.id,
        companyId: auth.companyId,
      },
    });

    if (!existingBranch) {
      throw new Error("Branch not found");
    }

    // Check if the new code conflicts with another branch
    if (input.code !== existingBranch.code) {
      const codeConflict = await db.branch.findFirst({
        where: {
          code: input.code,
          companyId: auth.companyId,
          id: { not: input.id },
        },
      });

      if (codeConflict) {
        throw new Error("A branch with this code already exists");
      }
    }

    const branch = await db.branch.update({
      where: { id: input.id },
      data: {
        name: input.name,
        code: input.code,
        address: input.address,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "BRANCH",
      entityId: branch.id,
      oldValues: {
        name: existingBranch.name,
        code: existingBranch.code,
        address: existingBranch.address,
      },
      newValues: {
        name: branch.name,
        code: branch.code,
        address: branch.address,
      },
    });

    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      address: branch.address,
    };
  });
