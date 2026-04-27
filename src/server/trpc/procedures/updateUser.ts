import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";

export const updateUser = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      userId: z.number(),
      email: z.string().email().optional(),
      password: z.string().min(8, "Password must be at least 8 characters").optional(),
      firstName: z.string().min(1, "First name is required").optional(),
      lastName: z.string().min(1, "Last name is required").optional(),
      roleId: z.number().nullable().optional(),
      position: z.string().nullable().optional(),
      identificationNumber: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
      branchId: z.number().nullable().optional(),
      departmentId: z.number().nullable().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.users");

    // Get existing user
    const existingUser = await db.user.findUnique({
      where: { id: input.userId },
      include: { 
        role: true,
        branch: true,
        department: true,
      },
    });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (existingUser.companyId !== auth.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only update users in your company",
      });
    }

    // Check email uniqueness if email is being changed
    if (input.email && input.email !== existingUser.email) {
      const userWithEmail = await db.user.findUnique({
        where: {
          email_companyId: {
            email: input.email,
            companyId: auth.companyId,
          },
        },
      });

      if (userWithEmail) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists in your company",
        });
      }
    }

    // Check identification number uniqueness if it's being changed
    if (
      input.identificationNumber !== undefined &&
      input.identificationNumber !== existingUser.identificationNumber
    ) {
      if (input.identificationNumber) {
        const userWithIdNumber = await db.user.findUnique({
          where: {
            identificationNumber_companyId: {
              identificationNumber: input.identificationNumber,
              companyId: auth.companyId,
            },
          },
        });

        if (userWithIdNumber) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A user with this identification number already exists in your company",
          });
        }
      }
    }

    // Verify role exists and belongs to company (if provided)
    if (input.roleId !== undefined && input.roleId !== null) {
      const role = await db.role.findUnique({
        where: { id: input.roleId },
      });

      if (!role || role.companyId !== auth.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid role",
        });
      }
    }

    // Verify branch exists and belongs to company (if provided)
    if (input.branchId !== undefined && input.branchId !== null) {
      const branch = await db.branch.findFirst({
        where: {
          id: input.branchId,
          companyId: auth.companyId,
        },
      });

      if (!branch) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid branch",
        });
      }
    }

    // Verify department exists and belongs to company (if provided)
    if (input.departmentId !== undefined && input.departmentId !== null) {
      const department = await db.department.findFirst({
        where: {
          id: input.departmentId,
          companyId: auth.companyId,
        },
      });

      if (!department) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid department",
        });
      }

      // If both branch and department are being set, verify they match
      const branchIdToCheck = input.branchId !== undefined ? input.branchId : existingUser.branchId;
      if (branchIdToCheck && department.branchId !== branchIdToCheck) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Department does not belong to the selected branch",
        });
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      passwordHash?: string;
      firstName?: string;
      lastName?: string;
      roleId?: number | null;
      position?: string | null;
      identificationNumber?: string | null;
      isActive?: boolean;
      branchId?: number | null;
      departmentId?: number | null;
    } = {};

    if (input.email !== undefined) updateData.email = input.email;
    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.roleId !== undefined) updateData.roleId = input.roleId;
    if (input.position !== undefined) updateData.position = input.position;
    if (input.identificationNumber !== undefined) updateData.identificationNumber = input.identificationNumber;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.branchId !== undefined) updateData.branchId = input.branchId;
    if (input.departmentId !== undefined) updateData.departmentId = input.departmentId;

    // Hash new password if provided
    if (input.password) {
      updateData.passwordHash = await bcryptjs.hash(input.password, 10);
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: input.userId },
      data: updateData,
      include: { 
        role: true,
        branch: true,
        department: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "USER",
      entityId: updatedUser.id,
      oldValues: {
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        roleId: existingUser.roleId,
        position: existingUser.position,
        identificationNumber: existingUser.identificationNumber,
        isActive: existingUser.isActive,
        branchId: existingUser.branchId,
        departmentId: existingUser.departmentId,
      },
      newValues: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roleId: updatedUser.roleId,
        position: updatedUser.position,
        identificationNumber: updatedUser.identificationNumber,
        isActive: updatedUser.isActive,
        branchId: updatedUser.branchId,
        departmentId: updatedUser.departmentId,
      },
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        position: updatedUser.position,
        identificationNumber: updatedUser.identificationNumber,
        isActive: updatedUser.isActive,
        role: updatedUser.role,
        branch: updatedUser.branch,
        department: updatedUser.department,
      },
    };
  });
