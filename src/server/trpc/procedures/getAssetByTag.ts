import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const getAssetByTag = baseProcedure
  .input(
    z.object({
      assetTag: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    const asset = await db.asset.findFirst({
      where: {
        assetTag: input.assetTag,
        companyId: auth.companyId,
      },
      select: {
        id: true,
        assetTag: true,
        name: true,
        status: true,
        photoUrl: true,
        qrCodeUrl: true,
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!asset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Asset not found with this tag",
      });
    }

    return {
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      status: asset.status,
      photoUrl: asset.photoUrl,
      qrCodeUrl: asset.qrCodeUrl,
      location: asset.location,
      assignedToUser: asset.assignedToUser,
    };
  });
