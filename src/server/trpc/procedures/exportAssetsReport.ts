import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { createAuditLog } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient } from "~/server/minio";

function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return "";
  }

  // Define headers
  const headers = [
    "Asset Tag",
    "Name",
    "Description",
    "Category",
    "Status",
    "Acquisition Cost",
    "Current Value",
    "Acquisition Date",
    "Service Date",
    "Serial Number",
    "Manufacturer",
    "Model",
    "Supplier",
    "Location",
    "Branch",
    "Department",
    "Asset Type",
    "Asset Class",
    "Asset Subclass",
    "Assigned To",
    "Assignment Start Date",
  ];

  // Create CSV rows
  const rows = data.map((asset) => [
    asset.assetTag,
    asset.name,
    asset.description || "",
    asset.category,
    asset.status,
    asset.acquisitionCost,
    asset.currentValue,
    asset.acquisitionDate
      ? new Date(asset.acquisitionDate).toLocaleDateString()
      : "",
    asset.serviceDate ? new Date(asset.serviceDate).toLocaleDateString() : "",
    asset.serialNumber || "",
    asset.manufacturer || "",
    asset.model || "",
    asset.supplier || "",
    asset.location?.name || "",
    asset.branch ? `${asset.branch.code} - ${asset.branch.name}` : "",
    asset.department
      ? `${asset.department.code} - ${asset.department.name}`
      : "",
    asset.assetType ? `${asset.assetType.code} - ${asset.assetType.name}` : "",
    asset.assetClass
      ? `${asset.assetClass.code} - ${asset.assetClass.description}`
      : "",
    asset.assetSubclass?.description || "",
    asset.currentAssignment
      ? `${asset.currentAssignment.user.firstName} ${asset.currentAssignment.user.lastName}`
      : "",
    asset.currentAssignment
      ? new Date(asset.currentAssignment.startDate).toLocaleDateString()
      : "",
  ]);

  // Escape and format CSV
  const escapeCSV = (value: any): string => {
    const stringValue = String(value);
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return csvContent;
}

export const exportAssetsReport = protectedProcedure
  .input(
    z.object({
      status: z.string().optional(),
      locationId: z.number().optional(),
      branchId: z.number().optional(),
      departmentId: z.number().optional(),
      assetTypeId: z.number().optional(),
      assetClassId: z.number().optional(),
      assignedToUserId: z.number().optional(),
      startDate: z.string().date().optional(),
      endDate: z.string().date().optional(),
      search: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Build the same where clause as listAssetsForReport
    const where: {
      companyId: number;
      status?: string;
      locationId?: number;
      branchId?: number;
      departmentId?: number;
      assetTypeId?: number;
      assetClassId?: number;
      assignedToUserId?: number;
      acquisitionDate?: {
        gte?: Date;
        lte?: Date;
      };
      OR?: Array<
        | { name: { contains: string; mode: "insensitive" } }
        | { assetTag: { contains: string; mode: "insensitive" } }
      >;
    } = {
      companyId: ctx.companyId,
    };

    if (input.status) {
      where.status = input.status;
    }

    if (input.locationId) {
      where.locationId = input.locationId;
    }

    if (input.branchId) {
      where.branchId = input.branchId;
    }

    if (input.departmentId) {
      where.departmentId = input.departmentId;
    }

    if (input.assetTypeId) {
      where.assetTypeId = input.assetTypeId;
    }

    if (input.assetClassId) {
      where.assetClassId = input.assetClassId;
    }

    if (input.assignedToUserId) {
      where.assignedToUserId = input.assignedToUserId;
    }

    if (input.startDate || input.endDate) {
      where.acquisitionDate = {};
      if (input.startDate) {
        where.acquisitionDate.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        where.acquisitionDate.lte = new Date(input.endDate);
      }
    }

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { assetTag: { contains: input.search, mode: "insensitive" } },
      ];
    }

    // Fetch assets with all related data
    const assets = await db.asset.findMany({
      where,
      include: {
        location: true,
        branch: true,
        department: {
          include: {
            branch: true,
          },
        },
        assetType: true,
        assetClass: true,
        assetSubclass: true,
        assignments: {
          where: {
            endDate: null,
          },
          include: {
            user: true,
          },
          take: 1,
        },
      },
      orderBy: {
        acquisitionDate: "desc",
      },
    });

    // Format assets for CSV
    const formattedAssets = assets.map((asset) => ({
      assetTag: asset.assetTag,
      name: asset.name,
      description: asset.description,
      category: asset.category,
      status: asset.status,
      acquisitionCost: asset.acquisitionCost,
      currentValue: asset.currentValue,
      acquisitionDate: asset.acquisitionDate,
      serviceDate: asset.serviceDate,
      serialNumber: asset.serialNumber,
      manufacturer: asset.manufacturer,
      model: asset.model,
      supplier: asset.supplier,
      location: asset.location
        ? {
            name: asset.location.name,
          }
        : null,
      branch: asset.branch
        ? {
            name: asset.branch.name,
            code: asset.branch.code,
          }
        : null,
      department: asset.department
        ? {
            name: asset.department.name,
            code: asset.department.code,
          }
        : null,
      assetType: asset.assetType
        ? {
            name: asset.assetType.name,
            code: asset.assetType.code,
          }
        : null,
      assetClass: asset.assetClass
        ? {
            code: asset.assetClass.code,
            description: asset.assetClass.description,
          }
        : null,
      assetSubclass: asset.assetSubclass
        ? {
            description: asset.assetSubclass.description,
          }
        : null,
      currentAssignment: asset.assignments[0]
        ? {
            user: {
              firstName: asset.assignments[0].user.firstName,
              lastName: asset.assignments[0].user.lastName,
            },
            startDate: asset.assignments[0].startDate,
          }
        : null,
    }));

    // Generate CSV content
    const csvContent = convertToCSV(formattedAssets);

    // Upload to MinIO
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `assets-report-${timestamp}.csv`;
    const bucketName = "reports";

    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Upload file
    const buffer = Buffer.from(csvContent, "utf-8");
    await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
      "Content-Type": "text/csv",
    });

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      60 * 60,
    );

    return {
      downloadUrl: presignedUrl,
      fileName,
      recordCount: assets.length,
    };
  });
