import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const listLocations = protectedProcedure
  .input(z.object({}).optional())
  .query(async ({ ctx, input }) => {
    const locations = await db.location.findMany({
      where: {
        companyId: ctx.companyId,
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
