import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { DepreciationService } from "~/server/services/depreciation.service";
import { handleTrpcError } from "~/server/trpc/error-mapper";

export const runMonthlyDepreciation = protectedProcedure
  .input(
    z.object({
      year: z.number().int().min(1900).max(2100),
      month: z.number().int().min(1).max(12),
      assetId: z.number().optional(), // Si no se pasa, corre para todos los activos
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
      if (input.assetId) {
        // Cálculo para un solo activo
        const result = await DepreciationService.calculateAssetDepreciation(
          input.assetId,
          input.year,
          input.month,
          ctx.companyId,
        );
        return { message: "Depreciación calculada con éxito", data: result };
      } else {
        // Ejecución en lote (Cierre de mes para toda la empresa)
        const batchResult =
          await DepreciationService.runMonthlyDepreciationBatch(
            ctx.companyId,
            input.year,
            input.month,
          );
        return {
          message: `Cierre de mes procesado. Éxitos: ${batchResult.successful}, Fallos: ${batchResult.failed}`,
          data: batchResult,
        };
      }
    } catch (error) {
      handleTrpcError(error);
    }
  });
