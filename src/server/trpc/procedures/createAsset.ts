import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { AssetService } from "~/server/services/asset.service";
import { handleTrpcError } from "~/server/trpc/error-mapper";

// Extraemos el esquema para que pueda ser reusado si es necesario
export const createAssetInputSchema = z.object({
  authToken: z.string(),
  assetTag: z.string().min(1, "Asset tag is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  acquisitionCost: z.number().min(0, "Acquisition cost must be non-negative"),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  residualValue: z.number().min(0).default(0),
  acquisitionDate: z.date(),
  serviceDate: z.date().optional(),
  depreciationMethod: z
    .enum([
      "STRAIGHT_LINE",
      "DECLINING_BALANCE",
      "UNITS_OF_PRODUCTION",
      "SUM_OF_YEARS_DIGITS",
    ])
    .default("STRAIGHT_LINE"),
  usefulLifeYears: z.number().int().min(1).optional(),
  usefulLifeUnits: z.number().int().min(1).optional(),
  convention: z
    .enum(["HALF_YEAR", "FULL_YEAR", "MID_MONTH"])
    .default("HALF_YEAR"),
  status: z
    .enum(["ACTIVE", "IN_REPAIR", "DISPOSED", "STOLEN", "LOST"])
    .default("ACTIVE"),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  locationId: z.number().optional(),
  photoUrl: z.string().optional(),

  // Supplier & Purchase Information
  supplier: z.string().optional(),
  purchaseDocument: z.string().optional(),
  supplierSerialNumber: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  quantity: z.number().int().min(1).optional(),
  currency: z.string().optional(),

  // Depreciation Details
  depreciationPercentage: z.number().min(0).max(100).optional(),
  depreciationStartDate: z.date().optional(),

  // Accounting Information
  accountingAssetAccount: z.string().optional(),
  accumulatedDepreciationAccount: z.string().optional(),
  depreciationExpenseAccount: z.string().optional(),
  fixedAssetLedger: z.string().optional(),

  // Organizational Structure
  classCode: z.string().optional(),
  costCenterCode: z.string().optional(),
  areaCode: z.string().optional(),
  subareaCode: z.string().optional(),
  branchCode: z.string().optional(),
  branchId: z.number().optional(),
  departmentId: z.number().optional(),
  assetTypeId: z.number().optional(),

  // Additional identification
  seriesNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),

  // Components
  components: z
    .array(
      z.object({
        name: z.string(),
        cost: z.number().min(0),
        usefulLifeYears: z.number().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),

  // Activity & Project
  activityProject: z.string().optional(),
  observations: z.string().optional(),

  // User Assignment
  assignedToUserId: z.number().optional(),

  // Custody Certificate Details
  assignmentBriefDescription: z.string().optional(),
  assignmentFixedAssetCode: z.string().optional(),
  assignmentInitialCondition: z.string().optional(),
  assignmentMaintenanceObligations: z.string().optional(),
});

// Inferimos el tipo de TypeScript a partir del esquema de Zod
export type CreateAssetInput = z.infer<typeof createAssetInputSchema>;

export const createAsset = baseProcedure
  .input(createAssetInputSchema)
  .mutation(async ({ input }) => {
    try {
      // 1. Autorización (Capa de Transporte)
      const auth = await requirePermission(input.authToken, "assets.create");

      // 2. Delegación a la Capa de Servicios de Dominio
      const newAsset = await AssetService.createAsset(
        input,
        auth.companyId,
        auth.user.id,
      );

      // 3. Respuesta limpia al cliente
      return newAsset;
    } catch (error) {
      // 4. Mapeo de errores de negocio a errores HTTP/tRPC
      handleTrpcError(error);
    }
  });
