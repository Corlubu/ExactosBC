import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient } from "~/server/minio";
import ExcelJS from "exceljs";

export const exportAssetsReportExcel = baseProcedure
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
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "finance.reports");

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
      companyId: auth.companyId,
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

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assets Report");

    // Define columns
    worksheet.columns = [
      { header: "Asset Tag", key: "assetTag", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Description", key: "description", width: 30 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Acquisition Cost", key: "acquisitionCost", width: 18 },
      { header: "Current Value", key: "currentValue", width: 18 },
      { header: "Acquisition Date", key: "acquisitionDate", width: 18 },
      { header: "Service Date", key: "serviceDate", width: 18 },
      { header: "Serial Number", key: "serialNumber", width: 20 },
      { header: "Manufacturer", key: "manufacturer", width: 20 },
      { header: "Model", key: "model", width: 20 },
      { header: "Supplier", key: "supplier", width: 20 },
      { header: "Location", key: "location", width: 20 },
      { header: "Branch", key: "branch", width: 25 },
      { header: "Department", key: "department", width: 25 },
      { header: "Asset Type", key: "assetType", width: 25 },
      { header: "Asset Class", key: "assetClass", width: 25 },
      { header: "Asset Subclass", key: "assetSubclass", width: 25 },
      { header: "Assigned To", key: "assignedTo", width: 25 },
      {
        header: "Assignment Start Date",
        key: "assignmentStartDate",
        width: 20,
      },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;

    // Add data rows
    assets.forEach((asset) => {
      worksheet.addRow({
        assetTag: asset.assetTag,
        name: asset.name,
        description: asset.description || "",
        category: asset.category,
        status: asset.status,
        acquisitionCost: asset.acquisitionCost,
        currentValue: asset.currentValue,
        acquisitionDate: asset.acquisitionDate
          ? new Date(asset.acquisitionDate).toLocaleDateString()
          : "",
        serviceDate: asset.serviceDate
          ? new Date(asset.serviceDate).toLocaleDateString()
          : "",
        serialNumber: asset.serialNumber || "",
        manufacturer: asset.manufacturer || "",
        model: asset.model || "",
        supplier: asset.supplier || "",
        location: asset.location?.name || "",
        branch: asset.branch
          ? `${asset.branch.code} - ${asset.branch.name}`
          : "",
        department: asset.department
          ? `${asset.department.code} - ${asset.department.name}`
          : "",
        assetType: asset.assetType
          ? `${asset.assetType.code} - ${asset.assetType.name}`
          : "",
        assetClass: asset.assetClass
          ? `${asset.assetClass.code} - ${asset.assetClass.description}`
          : "",
        assetSubclass: asset.assetSubclass?.description || "",
        assignedTo: asset.assignments[0]
          ? `${asset.assignments[0].user.firstName} ${asset.assignments[0].user.lastName}`
          : "",
        assignmentStartDate: asset.assignments[0]
          ? new Date(asset.assignments[0].startDate).toLocaleDateString()
          : "",
      });
    });

    // Apply borders to all cells with data
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Format currency columns
    const acquisitionCostCol = worksheet.getColumn("acquisitionCost");
    acquisitionCostCol.numFmt = "$#,##0.00";

    const currentValueCol = worksheet.getColumn("currentValue");
    currentValueCol.numFmt = "$#,##0.00";

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Upload to MinIO
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `assets-report-${timestamp}.xlsx`;
    const bucketName = "reports";

    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Upload file
    await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
