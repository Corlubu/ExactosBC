import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const login = baseProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Find user
    const user = await db.user.findFirst({
      where: {
        email: input.email,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Account is inactive",
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { userId: user.id, companyId: user.companyId },
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
        companyName: user.company.name,
      },
    };
  });
