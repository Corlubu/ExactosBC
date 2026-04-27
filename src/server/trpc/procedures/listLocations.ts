import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const listLocations = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const locations = await db.location.findMany({
      where: {
        companyId: auth.companyId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      locations: locations.map((location) => ({
        id: location.id,
        name: location.name,
        type: location.type,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        parentId: location.parentId,
        branchId: location.branchId,
        departmentId: location.departmentId,
        qrCodeUrl: location.qrCodeUrl,
      })),
    };
  });
