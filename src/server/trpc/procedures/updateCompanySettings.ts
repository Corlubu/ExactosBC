import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest, createAuditLog } from "~/server/utils/auth";

export const updateCompanySettings = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      name: z.string().min(1, "Company name is required"),
      // Branding
      logoUrl: z.string().optional(),
      brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
      // Regional Settings
      defaultCurrency: z.string().optional(),
      defaultTimezone: z.string().optional(),
      defaultLanguage: z.string().optional(),
      // Email Notifications
      emailNotificationsEnabled: z.boolean().optional(),
      notificationEmail: z.string().email("Must be a valid email").optional(),
      // API Access
      apiKey: z.string().optional(),
      // Barcode Label Configuration
      barcodeLabelConfig: z.any().optional(), // JSON object for label configuration
    })
  )
  .mutation(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);
    
    // Get current company data for audit log
    const currentCompany = await db.company.findUnique({
      where: {
        id: auth.companyId,
      },
    });
    
    if (!currentCompany) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }
    
    // Update company
    const updatedCompany = await db.company.update({
      where: {
        id: auth.companyId,
      },
      data: {
        name: input.name,
        // Branding
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        ...(input.brandColor !== undefined && { brandColor: input.brandColor }),
        // Regional Settings
        ...(input.defaultCurrency !== undefined && { defaultCurrency: input.defaultCurrency }),
        ...(input.defaultTimezone !== undefined && { defaultTimezone: input.defaultTimezone }),
        ...(input.defaultLanguage !== undefined && { defaultLanguage: input.defaultLanguage }),
        // Email Notifications
        ...(input.emailNotificationsEnabled !== undefined && { emailNotificationsEnabled: input.emailNotificationsEnabled }),
        ...(input.notificationEmail !== undefined && { notificationEmail: input.notificationEmail }),
        // API Access
        ...(input.apiKey !== undefined && { apiKey: input.apiKey }),
        // Barcode Label Configuration
        ...(input.barcodeLabelConfig !== undefined && { 
          barcodeLabelConfig: JSON.stringify(input.barcodeLabelConfig) 
        }),
      },
    });
    
    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      companyId: auth.companyId,
      action: "UPDATE",
      entityType: "COMPANY",
      entityId: auth.companyId,
      oldValues: {
        name: currentCompany.name,
        logoUrl: currentCompany.logoUrl,
        brandColor: currentCompany.brandColor,
        defaultCurrency: currentCompany.defaultCurrency,
        defaultTimezone: currentCompany.defaultTimezone,
        defaultLanguage: currentCompany.defaultLanguage,
        emailNotificationsEnabled: currentCompany.emailNotificationsEnabled,
        notificationEmail: currentCompany.notificationEmail,
        apiKey: currentCompany.apiKey,
        barcodeLabelConfig: currentCompany.barcodeLabelConfig 
          ? JSON.parse(currentCompany.barcodeLabelConfig) 
          : null,
      },
      newValues: {
        name: updatedCompany.name,
        logoUrl: updatedCompany.logoUrl,
        brandColor: updatedCompany.brandColor,
        defaultCurrency: updatedCompany.defaultCurrency,
        defaultTimezone: updatedCompany.defaultTimezone,
        defaultLanguage: updatedCompany.defaultLanguage,
        emailNotificationsEnabled: updatedCompany.emailNotificationsEnabled,
        notificationEmail: updatedCompany.notificationEmail,
        apiKey: updatedCompany.apiKey,
        barcodeLabelConfig: updatedCompany.barcodeLabelConfig 
          ? JSON.parse(updatedCompany.barcodeLabelConfig) 
          : null,
      },
    });
    
    return {
      success: true,
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        createdAt: updatedCompany.createdAt,
        logoUrl: updatedCompany.logoUrl,
        brandColor: updatedCompany.brandColor,
        defaultCurrency: updatedCompany.defaultCurrency,
        defaultTimezone: updatedCompany.defaultTimezone,
        defaultLanguage: updatedCompany.defaultLanguage,
        emailNotificationsEnabled: updatedCompany.emailNotificationsEnabled,
        notificationEmail: updatedCompany.notificationEmail,
        apiKey: updatedCompany.apiKey,
        barcodeLabelConfig: updatedCompany.barcodeLabelConfig 
          ? JSON.parse(updatedCompany.barcodeLabelConfig) 
          : null,
      },
    };
  });
