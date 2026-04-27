import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission, createAuditLog } from "~/server/utils/auth";

export const createUser = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      roleId: z.number().optional(),
      position: z.string().optional(),
      identificationNumber: z.string().optional(),
      isActive: z.boolean().optional().default(true),
      branchId: z.number().optional(),
      departmentId: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "admin.users");

    // Check if user with this email already exists in the company
    const existingUserByEmail = await db.user.findUnique({
      where: {
        email_companyId: {
          email: input.email,
          companyId: auth.companyId,
        },
      },
    });

    if (existingUserByEmail) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A user with this email already exists in your company",
      });
    }

    // Check if identification number is unique within company (if provided)
    if (input.identificationNumber) {
      const existingUserByIdNumber = await db.user.findUnique({
        where: {
          identificationNumber_companyId: {
            identificationNumber: input.identificationNumber,
            companyId: auth.companyId,
          },
        },
      });

      if (existingUserByIdNumber) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this identification number already exists in your company",
        });
      }
    }

    // Verify role exists and belongs to company (if provided)
    if (input.roleId) {
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
    if (input.branchId) {
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
    if (input.departmentId) {
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

      // If both branch and department are provided, verify they match
      if (input.branchId && department.branchId !== input.branchId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Department does not belong to the selected branch",
        });
      }
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(input.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        companyId: auth.companyId,
        roleId: input.roleId,
        position: input.position,
        identificationNumber: input.identificationNumber,
        isActive: input.isActive,
        branchId: input.branchId,
        departmentId: input.departmentId,
      },
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
      action: "CREATE",
      entityType: "USER",
      entityId: user.id,
      newValues: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        position: user.position,
        identificationNumber: user.identificationNumber,
        isActive: user.isActive,
        branchId: user.branchId,
        departmentId: user.departmentId,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        identificationNumber: user.identificationNumber,
        isActive: user.isActive,
        role: user.role,
        branch: user.branch,
        department: user.department,
      },
    };
  });
