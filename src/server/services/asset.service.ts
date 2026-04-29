import { db } from "~/server/db";
import QRCode from "qrcode";
import { minioClient, minioBaseUrl } from "~/server/minio";
import { createAuditLog } from "~/server/utils/auth";
import { ConflictError } from "~/server/domain/errors"; // El error de dominio que creamos antes
import type { CreateAssetInput } from "~/server/trpc/procedures/createAsset";

export class AssetService {
  static async createAsset(
    input: CreateAssetInput,
    companyId: number,
    userId: number,
  ) {
    // 1. Reglas de Negocio: Verificamos si el Tag ya existe para la compañía
    const existingAsset = await db.asset.findFirst({
      where: {
        assetTag: input.assetTag,
        companyId: companyId,
      },
    });

    if (existingAsset) {
      // Lanzamos un error de DOMINIO, no un TRPCError
      throw new ConflictError(
        `Ya existe un activo con el tag ${input.assetTag}`,
      );
    }

    // 2. Persistencia: Usamos db.$transaction
    const asset = await db.$transaction(async (tx) => {
      const createdAsset = await tx.asset.create({
        data: {
          companyId: companyId,
          enteredById: userId,

          // Mapeo de datos básicos
          assetTag: input.assetTag,
          name: input.name,
          description: input.description,
          category: input.category,
          acquisitionCost: input.acquisitionCost,
          currentValue: input.currentValue,
          residualValue: input.residualValue,
          acquisitionDate: input.acquisitionDate,
          serviceDate: input.serviceDate,
          depreciationMethod: input.depreciationMethod,
          usefulLifeYears: input.usefulLifeYears,
          usefulLifeUnits: input.usefulLifeUnits,
          convention: input.convention,
          status: input.status,
          serialNumber: input.serialNumber,
          manufacturer: input.manufacturer,
          model: input.model,
          locationId: input.locationId,
          photoUrl: input.photoUrl,
          supplier: input.supplier,
          purchaseDocument: input.purchaseDocument,
          supplierSerialNumber: input.supplierSerialNumber,
          unitCost: input.unitCost,
          quantity: input.quantity,
          currency: input.currency,
          depreciationPercentage: input.depreciationPercentage,
          depreciationStartDate: input.depreciationStartDate,
          accountingAssetAccount: input.accountingAssetAccount,
          accumulatedDepreciationAccount: input.accumulatedDepreciationAccount,
          depreciationExpenseAccount: input.depreciationExpenseAccount,
          fixedAssetLedger: input.fixedAssetLedger,
          classCode: input.classCode,
          costCenterCode: input.costCenterCode,
          areaCode: input.areaCode,
          subareaCode: input.subareaCode,
          branchCode: input.branchCode,
          branchId: input.branchId,
          departmentId: input.departmentId,
          assetTypeId: input.assetTypeId,
          seriesNumber: input.seriesNumber,
          invoiceNumber: input.invoiceNumber,
          activityProject: input.activityProject,
          observations: input.observations,
          assignedToUserId: input.assignedToUserId,

          // Insertamos componentes relacionados
          components:
            input.components && input.components.length > 0
              ? {
                  create: input.components.map((comp) => ({
                    name: comp.name,
                    cost: comp.cost,
                    usefulLifeYears: comp.usefulLifeYears,
                    description: comp.description,
                  })),
                }
              : undefined,
        },
        include: {
          location: true,
          components: true,
        },
      });

      // 3. Crear asignación de custodia si se envió un usuario asignado
      if (input.assignedToUserId) {
        await tx.assetAssignment.create({
          data: {
            assetId: createdAsset.id,
            userId: input.assignedToUserId,
            startDate: new Date(),
            notes: "Initial assignment upon asset creation",
            briefDescription: input.assignmentBriefDescription,
            fixedAssetCode: input.assignmentFixedAssetCode || input.assetTag,
            initialCondition: input.assignmentInitialCondition,
            maintenanceObligations: input.assignmentMaintenanceObligations,
          },
        });
      }

      return createdAsset;
    }); // Fin Transacción

    // 4. Integraciones Externas: Generación de código QR y MinIO
    let finalQrCodeUrl = null;
    try {
      const qrCodeBuffer = await QRCode.toBuffer(asset.assetTag, {
        errorCorrectionLevel: "H",
        type: "png",
        width: 300,
        margin: 2,
      });

      const timestamp = Date.now();
      const objectName = `public/qrcode/${timestamp}-${asset.assetTag}.png`;

      await minioClient.putObject(
        "asset-photos",
        objectName,
        qrCodeBuffer,
        qrCodeBuffer.length,
        { "Content-Type": "image/png" },
      );

      finalQrCodeUrl = `${minioBaseUrl}/asset-photos/${objectName}`;

      // Actualizamos el registro con la URL del QR
      await db.asset.update({
        where: { id: asset.id },
        data: { qrCodeUrl: finalQrCodeUrl },
      });
    } catch (qrError) {
      console.error(
        "Failed to generate/upload QR Code, but asset was created:",
        qrError,
      );
    }

    // 5. Auditoría
    await createAuditLog({
      userId: userId,
      companyId: companyId,
      action: "CREATE",
      entityType: "ASSET",
      entityId: asset.id,
      assetId: asset.id,
      newValues: {
        assetTag: asset.assetTag,
        name: asset.name,
        category: asset.category,
        acquisitionCost: asset.acquisitionCost,
      },
    });

    // 6. Retorno de los datos conformados
    return {
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      description: asset.description,
      category: asset.category,
      status: asset.status,
      acquisitionCost: asset.acquisitionCost,
      currentValue: asset.currentValue,
      location: asset.location,
      components: asset.components,
      qrCodeUrl: finalQrCodeUrl,
    };
  }
}
