import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createBranch = baseProcedure
  .input(
    z.object({
      name: z.string().min(1, "Branch name is required"),
      code: z.string().min(1, "Branch code is required"),
      address: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // Check if branch code already exists for this company
    const existingBranch = await db.branch.findFirst({
      where: {
        code: input.code,
        companyId: auth.companyId,
      },
    });

    if (existingBranch) {
      throw new Error("A branch with this code already exists");
    }

    const branch = await db.branch.create({
      data: {
        companyId: auth.companyId,
        name: input.name,
        code: input.code,
        address: input.address,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
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
