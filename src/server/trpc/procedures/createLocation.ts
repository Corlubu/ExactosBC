import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const createLocation = baseProcedure
  .input(
    z.object({
      name: z.string().min(1, "Location name is required"),
      type: z.string().min(1, "Location type is required"),
      address: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      parentId: z.number().optional(),
      branchId: z.number().optional(),
      departmentId: z.number().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    // If parentId is provided, verify it belongs to the same company
    if (input.parentId) {
      const parentLocation = await db.location.findUnique({
        where: { id: input.parentId },
      });

      if (!parentLocation || parentLocation.companyId !== auth.companyId) {
        throw new Error("Invalid parent location");
      }
    }

    // If branchId is provided, verify it belongs to the same company
    if (input.branchId) {
      const branch = await db.branch.findFirst({
        where: {
          id: input.branchId,
          companyId: auth.companyId,
        },
      });

      if (!branch) {
        throw new Error("Invalid branch");
      }
    }

    // If departmentId is provided, verify it belongs to the same company
    if (input.departmentId) {
      const department = await db.department.findFirst({
        where: {
          id: input.departmentId,
          companyId: auth.companyId,
        },
      });

      if (!department) {
        throw new Error("Invalid department");
      }

      // If both branch and department are provided, verify they match
      if (input.branchId && department.branchId !== input.branchId) {
        throw new Error("Department does not belong to the selected branch");
      }
    }

    const location = await db.location.create({
      data: {
        name: input.name,
        type: input.type,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        parentId: input.parentId,
        branchId: input.branchId,
        departmentId: input.departmentId,
        companyId: auth.companyId,
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "CREATE",
      entityType: "LOCATION",
      entityId: location.id,
      newValues: {
        name: location.name,
        type: location.type,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        parentId: location.parentId,
        branchId: location.branchId,
        departmentId: location.departmentId,
      },
    });

    return {
      location: {
        id: location.id,
        name: location.name,
        type: location.type,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        parentId: location.parentId,
        branchId: location.branchId,
        departmentId: location.departmentId,
      },
    };
  });
