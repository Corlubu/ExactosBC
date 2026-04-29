import { db } from "~/server/db";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "~/server/domain/errors";

export class DepreciationService {
  /**
   * Ejecuta el cierre de depreciación para un activo específico en un mes dado.
   */
  static async calculateAssetDepreciation(
    assetId: number,
    year: number,
    month: number,
    companyId: number,
  ) {
    // 1. Obtener el activo con todas sus relaciones contables NIIF
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        components: true,
        revaluations: {
          orderBy: { date: "desc" },
          take: 1, // Tomamos la revaluación más reciente si existe
        },
        monthlyBalances: {
          where: {
            OR: [
              { year: year, month: month }, // Para ver si ya se calculó este mes
              {
                // Para obtener el mes inmediatamente anterior
                year: month === 1 ? year - 1 : year,
                month: month === 1 ? 12 : month - 1,
              },
            ],
          },
        },
      },
    });

    if (!asset) throw new NotFoundError("Activo Fijo", assetId);
    if (asset.companyId !== companyId)
      throw new NotFoundError("Activo Fijo", assetId);
    if (asset.status !== "ACTIVE")
      throw new ConflictError(
        "Solo se pueden depreciar activos en estado ACTIVO.",
      );

    // 2. Evitar doble cálculo en el mismo mes
    const alreadyCalculated = asset.monthlyBalances.find(
      (b) => b.year === year && b.month === month,
    );
    if (alreadyCalculated) {
      throw new ConflictError(
        `El activo ya fue depreciado y cerrado para el periodo ${year}-${month}.`,
      );
    }

    // 3. Obtener el saldo inicial del mes (del mes anterior, o el costo original si es el primer mes)
    const previousBalance = asset.monthlyBalances.find(
      (b) =>
        b.year === (month === 1 ? year - 1 : year) &&
        b.month === (month === 1 ? 12 : month - 1),
    );

    let startingBookValue = previousBalance
      ? previousBalance.currentValue
      : asset.acquisitionCost;
    let accumulatedDepreciation = previousBalance
      ? previousBalance.accumulatedDepreciation
      : 0;

    let totalMonthlyDepreciationExpense = 0;

    // 4. Lógica NIIF: Componentización (NIC 16)
    if (asset.components.length > 0) {
      // Cálculo por componentes (Ej: El motor se deprecia distinto al fuselaje)
      for (const component of asset.components) {
        if (!component.usefulLifeYears) continue;

        const monthlyExpense = this.calculateStraightLine(
          component.cost,
          component.residualValue,
          component.usefulLifeYears * 12, // Convertimos años a meses
          startingBookValue, // Simplificado, idealmente tendríamos bookValue por componente
        );
        totalMonthlyDepreciationExpense += monthlyExpense;
      }
    } else {
      // Cálculo de Activo Simple (Sin componentes)
      if (!asset.usefulLifeYears) {
        throw new ValidationError(
          "El activo no tiene componentes ni vida útil definida.",
        );
      }

      totalMonthlyDepreciationExpense = this.calculateStraightLine(
        asset.acquisitionCost, // Ojo: Si hubo revaluación (NIC 36), la base cambia prospectivamente
        asset.residualValue,
        asset.usefulLifeYears * 12,
        startingBookValue,
      );
    }

    // 5. Validación Límite de Valor Residual (¡Crítico para Contabilidad!)
    const maximumDepreciableAmount = startingBookValue - asset.residualValue;

    if (maximumDepreciableAmount <= 0) {
      // El activo ya llegó a su valor de rescate, la depreciación es 0
      totalMonthlyDepreciationExpense = 0;
    } else if (totalMonthlyDepreciationExpense > maximumDepreciableAmount) {
      // Si el gasto del mes hace que perfore el valor residual, lo topamos
      totalMonthlyDepreciationExpense = maximumDepreciableAmount;
    }

    // 6. Transacción de Base de Datos (Persistencia)
    const closingBookValue =
      startingBookValue - totalMonthlyDepreciationExpense;
    const newAccumulated =
      accumulatedDepreciation + totalMonthlyDepreciationExpense;

    return await db.$transaction(async (tx) => {
      // A. Guardamos el asiento contable de depreciación
      const calc = await tx.depreciationCalculation.create({
        data: {
          assetId: asset.id,
          calculationDate: new Date(),
          periodStartDate: new Date(year, month - 1, 1),
          periodEndDate: new Date(year, month, 0), // Último día del mes
          depreciationAmount: totalMonthlyDepreciationExpense,
          accumulatedDepreciation: newAccumulated,
          bookValue: closingBookValue,
          method: asset.depreciationMethod,
        },
      });

      // B. Guardamos la "Foto" del saldo de cierre mensual (MonthlyBalanceClosure)
      const closure = await tx.monthlyBalanceClosure.create({
        data: {
          assetId: asset.id,
          companyId: companyId,
          year: year,
          month: month,
          acquisitionCost: asset.acquisitionCost,
          currentValue: closingBookValue,
          accumulatedDepreciation: newAccumulated,
          monthlyDepreciation: totalMonthlyDepreciationExpense,
        },
      });

      // C. Actualizamos el valor actual en vivo en el Activo
      await tx.asset.update({
        where: { id: asset.id },
        data: { currentValue: closingBookValue },
      });

      return { calculation: calc, closure };
    });
  }

  /**
   * Ejecuta el cálculo masivo para todos los activos de una compañía en un mes.
   * Útil para procesos Batch o CRON Jobs a final de mes.
   */
  static async runMonthlyDepreciationBatch(
    companyId: number,
    year: number,
    month: number,
  ) {
    const activeAssets = await db.asset.findMany({
      where: {
        companyId: companyId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (const asset of activeAssets) {
      try {
        await this.calculateAssetDepreciation(asset.id, year, month, companyId);
        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Activo ID ${asset.id}: ${error.message}`);
      }
    }

    return results;
  }

  // --- Funciones Matemáticas Privadas ---

  private static calculateStraightLine(
    historicalCost: number,
    residualValue: number,
    totalUsefulLifeMonths: number,
    currentBookValue: number,
  ): number {
    // Formula prospectiva (Soporta cambios por revaluaciones)
    // Gasto = (Costo - Valor Residual) / Vida Útil Total
    return (historicalCost - residualValue) / totalUsefulLifeMonths;
  }
}
