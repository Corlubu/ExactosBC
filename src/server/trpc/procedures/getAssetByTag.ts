import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getAssetByTag = protectedProcedure
  .input(
    z.object({
      assetTag: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const asset = await db.asset.findFirst({
      where: {
        assetTag: input.assetTag,
        companyId: ctx.companyId,
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
