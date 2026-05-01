// src/server/trpc/procedures/createAssetClass.ts
import { z } from "zod";
import { protectedProcedureWithPermission } from "~/server/trpc/main"; // Usamos el procedure protegido
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const createAssetClass = protectedProcedureWithPermission
  .input(
    z.object({
      // ELIMINADO: authToken: z.string()
      assetTypeId: z.number(),
      code: z.string().min(1, "Asset class code is required"),
      description: z.string().min(1, "Description is required"),
      accountingAccount: z.string().optional(),
      budgetCode: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Ya no necesitamos requirePermission con token, usamos el contexto seguro
    const { companyId, user } = ctx;

    // Verificar que el assetType existe y pertenece a la compañía
    const assetType = await db.assetType.findFirst({
      where: {
        id: input.assetTypeId,
        companyId: companyId,
      },
    });

    if (!assetType) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Asset type not found",
      });
    }

    // Verificar si el código ya existe
    const existingAssetClass = await db.assetClass.findFirst({
      where: {
        code: input.code,
        assetTypeId: input.assetTypeId,
      },
    });

    if (existingAssetClass) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "An asset class with this code already exists for this asset type",
      });
    }

    const assetClass = await db.assetClass.create({
      data: {
        companyId: companyId,
        assetTypeId: input.assetTypeId,
        code: input.code,
        description: input.description,
        accountingAccount: input.accountingAccount,
        budgetCode: input.budgetCode,
      },
      include: {
        assetType: true,
      },
    });

    // Crear log de auditoría
    await createAuditLog({
      userId: user.id,
      companyId: companyId,
      action: "CREATE",
      entityType: "ASSET_CLASS",
      entityId: assetClass.id,
      newValues: {
        assetTypeId: assetClass.assetTypeId,
        code: assetClass.code,
        description: assetClass.description,
        accountingAccount: assetClass.accountingAccount,
        budgetCode: assetClass.budgetCode,
      },
    });

    return {
      id: assetClass.id,
      assetTypeId: assetClass.assetTypeId,
      code: assetClass.code,
      description: assetClass.description,
      accountingAccount: assetClass.accountingAccount,
      budgetCode: assetClass.budgetCode,
      assetType: {
        id: assetClass.assetType.id,
        name: assetClass.assetType.name,
        code: assetClass.assetType.code,
      },
    };
  });
