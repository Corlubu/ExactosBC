import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";
import { minioClient, minioBaseUrl } from "~/server/minio";
import { getBaseUrl } from "~/server/utils/base-url";
import { chromium } from "playwright";
import { Readable } from "stream";

export const generateCustodianCertificatePdf = baseProcedure
  .input(
    z.object({
      custodianId: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    // Verify the custodian belongs to the same company
    const custodian = await db.user.findFirst({
      where: {
        id: input.custodianId,
        companyId: auth.companyId,
      },
    });

    if (!custodian) {
      throw new Error("Custodian not found");
    }

    // Ensure the certificates bucket exists
    const bucketName = "certificates";
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
        viewport: { width: 1200, height: 1600 },
      });
      const page = await context.newPage();

      // Get the base URL of the application
      const baseUrl = getBaseUrl();

      // Inject auth token into localStorage before navigating
      await page.goto(baseUrl);
      await page.evaluate((token) => {
        localStorage.setItem(
          "auth-storage",
          JSON.stringify({
            state: { authToken: token },
            version: 0,
          }),
        );
      }, input.authToken);

      // Navigate to the custody certificate page
      const certificateUrl = `${baseUrl}/app/custodians/${input.custodianId}`;
      await page.goto(certificateUrl, { waitUntil: "networkidle" });

      // Wait for the certificate content to load
      await page.waitForSelector("text=CUSTODY CERTIFICATE", {
        timeout: 10000,
      });

      // Generate PDF with proper formatting
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      });

      await browser.close();

      // Generate filename with timestamp
      const timestamp = Date.now();
      const filename = `custody-certificate-${input.custodianId}-${timestamp}.pdf`;

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

      // Generate a presigned URL valid for 1 hour
      const downloadUrl = await minioClient.presignedGetObject(
        bucketName,
        filename,
        24 * 60 * 60, // 24 hours
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
