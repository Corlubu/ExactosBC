import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { protectedProcedure } from "~/server/trpc/main";

// Eliminamos .input() porque la consulta no recibe parámetros del cliente
export const getCompanySettings = protectedProcedure.query(async ({ ctx }) => {
  let company;

  // 1. Si el usuario ya inició sesión, el middleware en main.ts
  // habrá inyectado el companyId en el contexto (ctx).
  if (ctx.companyId) {
    company = await db.company.findUnique({
      where: { id: ctx.companyId },
    });
  } else {
    // 2. Si NO hay sesión (está en la pantalla de /login), traemos
    // la configuración general (la primera empresa) para mostrar el logo.
    company = await db.company.findFirst();
  }

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
      ? JSON.parse(company.barcodeLabelConfig as string)
      : null,
  };
});
