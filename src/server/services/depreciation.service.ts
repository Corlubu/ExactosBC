import { db } from "~/server/db";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "~/server/domain/errors";

export class DepreciationService {
  /**
   * Ejecuta el cierre de depreciación mensual.
   * Arquitectura NIIF (NIC 16): Soporta cálculo detallado por Componentes (Unidades Depreciables)
   * y cálculo prospectivo para revaluaciones o deterioros.
   */
  static async calculateAssetDepreciation(
    assetId: number,
    year: number,
    month: number,
    companyId: number,
  ) {
    // 1. Obtener el activo con sus componentes y saldos recientes
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        components: true,
        monthlyBalances: {
          where: {
            OR: [
              { year: year, month: month }, // Cierre de este mes (para validar si ya existe)
              {
                // Cierre del mes anterior (para usar como saldo inicial)
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

    // 2. Prevenir cálculo duplicado en el mismo mes (Verificamos el cierre maestro, componentId: null)
    const alreadyCalculated = asset.monthlyBalances.find(
      (b) => b.year === year && b.month === month && b.componentId === null,
    );
    if (alreadyCalculated) {
      throw new ConflictError(
        `El activo ya fue depreciado para el periodo ${year}-${month}.`,
      );
    }

    // Arrays para guardar la data que enviaremos en la transacción
    const newClosuresData: any[] = [];
    const componentUpdates: any[] = [];

    // Variables para el Total Consolidado (Nivel Activo)
    let totalMonthlyDepreciationExpense = 0;
    let totalAccumulatedDepreciation = 0;
    let totalClosingBookValue = 0;
    let totalAcquisitionCost =
      asset.components.length > 0 ? 0 : asset.acquisitionCost;

    // ========================================================================
    // 3A. RUTA 1: DEPRECIACIÓN POR COMPONENTES (Nivel de granularidad alto)
    // ========================================================================
    if (asset.components.length > 0) {
      for (const component of asset.components) {
        // Buscar el saldo del mes anterior ESPECÍFICO para este componente
        const prevBal = asset.monthlyBalances.find(
          (b) =>
            b.componentId === component.id &&
            b.year === (month === 1 ? year - 1 : year) &&
            b.month === (month === 1 ? 12 : month - 1),
        );

        // NIIF: Saldo inicial. Si hubo revaluación, el currentValue del componente lo refleja.
        const startingBookValue = prevBal
          ? prevBal.currentValue
          : component.currentValue > 0
            ? component.currentValue
            : component.cost;

        const accumulatedDepreciation = prevBal
          ? prevBal.accumulatedDepreciation
          : component.accumulatedDepreciation;

        totalAcquisitionCost += component.cost; // Sumar al costo histórico consolidado

        // Determinar cuántos meses lleva depreciándose ESTE componente
        const componentMonthsDepreciated = await db.monthlyBalanceClosure.count(
          {
            where: { componentId: component.id },
          },
        );

        const remainingMonths = component.usefulLifeYears
          ? component.usefulLifeYears * 12 - componentMonthsDepreciated
          : 0;

        let monthlyExpense = 0;

        if (remainingMonths > 0 && component.usefulLifeYears) {
          monthlyExpense = this.calculateDepreciationExpense(
            asset.depreciationMethod, // Hereda el método del activo padre
            startingBookValue,
            component.residualValue,
            remainingMonths,
          );
        }

        // Límite de Valor Residual del Componente
        const maxDepreciableAmount =
          startingBookValue - component.residualValue;
        if (maxDepreciableAmount <= 0) monthlyExpense = 0;
        else if (monthlyExpense > maxDepreciableAmount)
          monthlyExpense = maxDepreciableAmount;

        const closingBookValue = startingBookValue - monthlyExpense;
        const newAccumulated = accumulatedDepreciation + monthlyExpense;

        // Agregar a los totales consolidados del Activo
        totalMonthlyDepreciationExpense += monthlyExpense;
        totalAccumulatedDepreciation += newAccumulated;
        totalClosingBookValue += closingBookValue;

        // Preparar "Foto" del saldo de este componente
        newClosuresData.push({
          assetId: asset.id,
          componentId: component.id,
          companyId: companyId,
          year: year,
          month: month,
          acquisitionCost: component.cost,
          currentValue: closingBookValue,
          accumulatedDepreciation: newAccumulated,
          monthlyDepreciation: monthlyExpense,
        });

        // Preparar actualización en vivo del componente
        componentUpdates.push({
          id: component.id,
          data: {
            currentValue: closingBookValue,
            accumulatedDepreciation: newAccumulated,
          },
        });
      }
    }
    // ========================================================================
    // 3B. RUTA 2: DEPRECIACIÓN GLOBAL (Activo simple sin componentes)
    // ========================================================================
    else {
      if (
        !asset.usefulLifeYears &&
        asset.depreciationMethod !== "UNITS_OF_PRODUCTION"
      ) {
        throw new ValidationError(
          "El activo no tiene componentes ni vida útil definida.",
        );
      }

      const prevBal = asset.monthlyBalances.find(
        (b) =>
          b.componentId === null &&
          b.year === (month === 1 ? year - 1 : year) &&
          b.month === (month === 1 ? 12 : month - 1),
      );

      const startingBookValue = prevBal
        ? prevBal.currentValue
        : asset.currentValue > 0
          ? asset.currentValue
          : asset.acquisitionCost;

      const accumulatedDepreciation = prevBal
        ? prevBal.accumulatedDepreciation
        : 0;

      const monthsAlreadyDepreciated = await db.monthlyBalanceClosure.count({
        where: { assetId: asset.id, componentId: null },
      });

      const remainingMonths = asset.usefulLifeYears
        ? asset.usefulLifeYears * 12 - monthsAlreadyDepreciated
        : 0;

      if (
        remainingMonths > 0 ||
        asset.depreciationMethod === "UNITS_OF_PRODUCTION"
      ) {
        totalMonthlyDepreciationExpense = this.calculateDepreciationExpense(
          asset.depreciationMethod,
          startingBookValue,
          asset.residualValue,
          remainingMonths,
        );
      }

      const maxDepreciableAmount = startingBookValue - asset.residualValue;
      if (maxDepreciableAmount <= 0) totalMonthlyDepreciationExpense = 0;
      else if (totalMonthlyDepreciationExpense > maxDepreciableAmount)
        totalMonthlyDepreciationExpense = maxDepreciableAmount;

      totalClosingBookValue =
        startingBookValue - totalMonthlyDepreciationExpense;
      totalAccumulatedDepreciation =
        accumulatedDepreciation + totalMonthlyDepreciationExpense;
    }

    // 4. Preparar el Cierre Consolidado Maestro (componentId: null)
    newClosuresData.push({
      assetId: asset.id,
      componentId: null, // Representa el TOTAL del activo
      companyId: companyId,
      year: year,
      month: month,
      acquisitionCost: totalAcquisitionCost,
      currentValue: totalClosingBookValue,
      accumulatedDepreciation: totalAccumulatedDepreciation,
      monthlyDepreciation: totalMonthlyDepreciationExpense,
    });

    // ========================================================================
    // 5. Transacción de Base de Datos (Persistencia ACID)
    // ========================================================================
    return await db.$transaction(async (tx) => {
      // A. Crear todos los cierres mensuales (Componentes + Consolidado)
      await tx.monthlyBalanceClosure.createMany({
        data: newClosuresData,
      });

      // B. Guardar el asiento contable general (DepreciationCalculation)
      const calculation = await tx.depreciationCalculation.create({
        data: {
          assetId: asset.id,
          calculationDate: new Date(),
          periodStartDate: new Date(year, month - 1, 1),
          periodEndDate: new Date(year, month, 0), // Último día del mes
          depreciationAmount: totalMonthlyDepreciationExpense,
          accumulatedDepreciation: totalAccumulatedDepreciation,
          bookValue: totalClosingBookValue,
          method: asset.depreciationMethod,
        },
      });

      // C. Actualizar el valor actual en vivo del Activo Maestro
      await tx.asset.update({
        where: { id: asset.id },
        data: { currentValue: totalClosingBookValue },
      });

      // D. Actualizar el valor en vivo de cada Componente individual
      if (componentUpdates.length > 0) {
        for (const update of componentUpdates) {
          await tx.assetComponent.update({
            where: { id: update.id },
            data: update.data,
          });
        }
      }

      return {
        calculation,
        totalMonthlyDepreciationExpense,
        totalClosingBookValue,
      };
    });
  }

  /**
   * Ejecuta el cálculo masivo para todos los activos de una compañía en un mes.
   */
  static async runMonthlyDepreciationBatch(
    companyId: number,
    year: number,
    month: number,
  ) {
    const activeAssets = await db.asset.findMany({
      where: { companyId: companyId, status: "ACTIVE" },
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

  // ========================================================================
  // Funciones Matemáticas Privadas (Motor de Algoritmos NIIF)
  // ========================================================================

  private static calculateDepreciationExpense(
    method: string,
    currentBookValue: number,
    residualValue: number,
    remainingUsefulLifeMonths: number,
  ): number {
    if (currentBookValue <= residualValue) return 0;

    switch (method) {
      case "STRAIGHT_LINE":
        if (remainingUsefulLifeMonths <= 0) return 0;
        return this.calculateStraightLine(
          currentBookValue,
          residualValue,
          remainingUsefulLifeMonths,
        );

      case "DECLINING_BALANCE":
        if (remainingUsefulLifeMonths <= 0) return 0;
        const straightLineRate = 1 / remainingUsefulLifeMonths;
        const decliningRate = straightLineRate * 2; // Doble cuota NIIF
        return currentBookValue * decliningRate;

      case "SUM_OF_YEARS_DIGITS":
        if (remainingUsefulLifeMonths <= 0) return 0;
        const remainingYears = Math.ceil(remainingUsefulLifeMonths / 12);
        const sumOfYears = (remainingYears * (remainingYears + 1)) / 2;
        const yearFraction = remainingYears / sumOfYears;
        return ((currentBookValue - residualValue) * yearFraction) / 12;

      case "UNITS_OF_PRODUCTION":
        throw new ValidationError(
          "El método UNITS_OF_PRODUCTION requiere parámetros de uso operativo que deben inyectarse en este cierre.",
        );

      default:
        if (remainingUsefulLifeMonths <= 0) return 0;
        return this.calculateStraightLine(
          currentBookValue,
          residualValue,
          remainingUsefulLifeMonths,
        );
    }
  }

  private static calculateStraightLine(
    currentBookValue: number,
    residualValue: number,
    remainingUsefulLifeMonths: number,
  ): number {
    return (currentBookValue - residualValue) / remainingUsefulLifeMonths;
  }
}
