import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createBranch = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1, "Branch name is required"),
      code: z.string().min(1, "Branch code is required"),
      address: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if branch code already exists for this company
    const existingBranch = await db.branch.findFirst({
      where: {
        code: input.code,
        companyId: ctx.companyId,
      },
    });

    if (existingBranch) {
      throw new Error("A branch with this code already exists");
    }

    const branch = await db.branch.create({
      data: {
        companyId: ctx.companyId,
        name: input.name,
        code: input.code,
        address: input.address,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.user.id,
      companyId: ctx.companyId,
      action: "CREATE",
      entityType: "BRANCH",
      entityId: branch.id,
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
