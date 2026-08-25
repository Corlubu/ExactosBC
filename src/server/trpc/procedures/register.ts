import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { protectedProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const register = protectedProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      companyName: z.string().min(1, "Company name is required"),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A user with this email already exists",
      });
    }

    // Create or find company
    let company = await db.company.findFirst({
      where: {
        name: input.companyName,
      },
    });

    if (!company) {
      company = await db.company.create({
        data: {
          name: input.companyName,
        },
      });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(input.password, 10);

    // Get all permissions
    const allPermissions = await db.permission.findMany();

    // Create Admin role for the company if it doesn't exist
    let adminRole = await db.role.findFirst({
      where: {
        name: "Admin",
        companyId: company.id,
      },
    });

    if (!adminRole) {
      adminRole = await db.role.create({
        data: {
          name: "Admin",
          description: "Full system access",
          companyId: company.id,
          permissions: {
            create: allPermissions.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        },
      });
    }

    // Create user
    const user = await db.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        companyId: company.id,
        roleId: adminRole.id,
      },
    });

    // Generate JWT token
    const authToken = jwt.sign(
      { userId: user.id, companyId: company.id },
      env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    return {
      authToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId,
      },
    };
  });
