import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { requirePermission } from "~/server/utils/auth";
import { minioClient } from "~/server/minio";
import { getBaseUrl } from "~/server/utils/base-url";
import { chromium } from "playwright";
import { Readable } from "stream";

const inputSchema = z.object({
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
});

export const exportAssetsReportPdf = baseProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const auth = await requirePermission(input.authToken, "finance.reports");

    // Ensure the reports bucket exists
    const bucketName = "reports";
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Launch headless browser
    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const context = await browser.newContext({
        viewport: { width: 1600, height: 1200 },
      });
      const page = await context.newPage();

      // Get the base URL of the application
      const baseUrl = getBaseUrl();

      // Inject auth token into localStorage before navigating
      await page.goto(baseUrl);
      await page.evaluate((token) => {
        localStorage.setItem(
          "assetmaster-auth",
          JSON.stringify({
            state: { authToken: token },
            version: 0,
          }),
        );
      }, input.authToken);

      // Build URL with search parameters
      const searchParams = new URLSearchParams();
      if (input.search) searchParams.set("search", input.search);
      if (input.status) searchParams.set("status", input.status);
      if (input.locationId)
        searchParams.set("locationId", input.locationId.toString());
      if (input.branchId)
        searchParams.set("branchId", input.branchId.toString());
      if (input.departmentId)
        searchParams.set("departmentId", input.departmentId.toString());
      if (input.assetTypeId)
        searchParams.set("assetTypeId", input.assetTypeId.toString());
      if (input.assetClassId)
        searchParams.set("assetClassId", input.assetClassId.toString());
      if (input.assignedToUserId)
        searchParams.set("assignedToUserId", input.assignedToUserId.toString());
      if (input.startDate) searchParams.set("startDate", input.startDate);
      if (input.endDate) searchParams.set("endDate", input.endDate);

      const pdfViewUrl = `${baseUrl}/app/reports/pdf-view?${searchParams.toString()}`;

      // Navigate to the PDF view page
      await page.goto(pdfViewUrl, { waitUntil: "networkidle" });

      // Wait for the report content to load
      await page.waitForSelector("text=Asset Report", { timeout: 15000 });

      // Give it a moment for any final rendering
      await page.waitForTimeout(1000);

      // Generate PDF with landscape orientation for better table display
      const pdfBuffer = await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true,
        margin: {
          top: "15mm",
          right: "10mm",
          bottom: "15mm",
          left: "10mm",
        },
      });

      await browser.close();

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `assets-report-${timestamp}.pdf`;

      // Upload to MinIO
      const stream = Readable.from(pdfBuffer);
      await minioClient.putObject(
        bucketName,
        filename,
        stream,
        pdfBuffer.length,
        {
          "Content-Type": "application/pdf",
        },
      );

      // Generate a presigned URL valid for 24 hours
      const downloadUrl = await minioClient.presignedGetObject(
        bucketName,
        filename,
        24 * 60 * 60,
      );

      return {
        success: true,
        downloadUrl,
        filename,
      };
    } catch (error) {
      await browser.close();
      throw error;
    }
  });
