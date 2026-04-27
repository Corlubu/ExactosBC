import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";

export const getCompanySettings = baseProcedure
  .input(z.object({ authToken: z.string() }))
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);
    
    const company = await db.company.findUnique({
      where: {
        id: auth.companyId,
      },
    });
    
    if (!company) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }
    
    return {
      id: company.id,
      name: company.name,
      createdAt: company.createdAt,
      // Branding
      logoUrl: company.logoUrl,
      brandColor: company.brandColor,
      // Regional Settings
      defaultCurrency: company.defaultCurrency,
      defaultTimezone: company.defaultTimezone,
      defaultLanguage: company.defaultLanguage,
      // Email Notifications
      emailNotificationsEnabled: company.emailNotificationsEnabled,
      notificationEmail: company.notificationEmail,
      // API Access
      apiKey: company.apiKey,
      // Barcode Label Configuration
      barcodeLabelConfig: company.barcodeLabelConfig 
        ? JSON.parse(company.barcodeLabelConfig) 
        : null,
    };
  });
