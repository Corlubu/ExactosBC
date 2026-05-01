import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";

export const updateLocation = baseProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(1, "Location name is required").optional(),
      type: z.string().min(1, "Location type is required").optional(),
      address: z.string().optional().nullable(),
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
      parentId: z.number().optional().nullable(),
      branchId: z.number().optional().nullable(),
      departmentId: z.number().optional().nullable(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.settings");

    const existingLocation = await db.location.findUnique({
      where: { id: input.id },
    });

    if (!existingLocation || existingLocation.companyId !== auth.companyId) {
      throw new Error("Location not found");
    }

    // If parentId is being updated, validate it
    if (input.parentId !== undefined) {
      if (input.parentId === input.id) {
        throw new Error("A location cannot be its own parent");
      }

      if (input.parentId !== null) {
        const parentLocation = await db.location.findUnique({
          where: { id: input.parentId },
        });

        if (!parentLocation || parentLocation.companyId !== auth.companyId) {
          throw new Error("Invalid parent location");
        }
      }
    }

    // If branchId is being updated, validate it
    if (input.branchId !== undefined && input.branchId !== null) {
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

    // If departmentId is being updated, validate it
    if (input.departmentId !== undefined && input.departmentId !== null) {
      const department = await db.department.findFirst({
        where: {
          id: input.departmentId,
          companyId: auth.companyId,
        },
      });

      if (!department) {
        throw new Error("Invalid department");
      }

      // If both branch and department are being set, verify they match
      const branchIdToCheck =
        input.branchId !== undefined
          ? input.branchId
          : existingLocation.branchId;
      if (branchIdToCheck && department.branchId !== branchIdToCheck) {
        throw new Error("Department does not belong to the selected branch");
      }
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.parentId !== undefined) updateData.parentId = input.parentId;
    if (input.branchId !== undefined) updateData.branchId = input.branchId;
    if (input.departmentId !== undefined)
      updateData.departmentId = input.departmentId;

    const location = await db.location.update({
      where: { id: input.id },
      data: updateData,
    });

    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "LOCATION",
      entityId: location.id,
      oldValues: {
        name: existingLocation.name,
        type: existingLocation.type,
        address: existingLocation.address,
        latitude: existingLocation.latitude,
        longitude: existingLocation.longitude,
        parentId: existingLocation.parentId,
        branchId: existingLocation.branchId,
        departmentId: existingLocation.departmentId,
      },
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
