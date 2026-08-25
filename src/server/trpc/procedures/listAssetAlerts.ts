import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listAssetAlerts = protectedProcedure
  .input(
    z
      .object({
        status: z.enum(["ACTIVE", "ACKNOWLEDGED", "DISMISSED"]).optional(),
        assetId: z.number().optional(),
        alertType: z
          .enum([
            "DEPRECIATION_MILESTONE",
            "BOOK_VALUE_THRESHOLD",
            "FULLY_DEPRECIATED",
          ])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
      })
      .optional(), // Hacemos el input opcional por seguridad
  )
  .query(async ({ ctx, input }) => {
    // 1. Extraemos SOLO el companyId del contexto seguro (¡NO usamos todo ctx!)
    const { companyId } = ctx;

    // 2. Construimos un objeto 'where' LIMPIO, estrictamente con columnas de la BD
    const where: any = {
      companyId: companyId,
    };

    // 3. Agregamos los filtros opcionales si vienen en el input
    if (input?.status) {
      where.status = input.status;
    }

    if (input?.assetId) {
      where.assetId = input.assetId;
    }

    if (input?.alertType) {
      where.alertType = input.alertType;
    }

    // 4. Hacemos la consulta a Prisma
    const alerts = await db.assetAlert.findMany({
      where, // Ahora 'where' es seguro y Prisma lo entenderá
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetTag: true,
            category: true,
          },
        },
        alertSetting: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        triggeredAt: "desc",
      },
      take: input?.limit || 50,
    });

    // Count active alerts for summary
    const activeCount = await db.assetAlert.count({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
    });

    return {
      alerts,
      activeCount,
    };
  });
