import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { authenticateRequest } from "~/server/utils/auth";
import { db } from "~/server/db";

export const getEmployeeDashboardStats = baseProcedure
  .input(z.object({}))
  .query(async ({ input }) => {
    const auth = await authenticateRequest(input.authToken);

    // Get assets currently assigned to the user
    const assignedAssets = await db.asset.findMany({
      where: {
        companyId: auth.companyId,
        assignedToUserId: auth.user.id,
        status: {
          in: ["ACTIVE", "IN_REPAIR"],
        },
      },
      include: {
        location: true,
        assetType: true,
        branch: true,
        department: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate total value of assigned assets
    const totalAssignedValue = assignedAssets.reduce(
      (sum, asset) => sum + asset.currentValue,
      0,
    );

    // Get recent asset movements involving the user (last 30 days)
    const recentMovements = await db.assetMovement.findMany({
      where: {
        OR: [{ fromUserId: auth.user.id }, { toUserId: auth.user.id }],
        movementDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        asset: true,
        fromUser: true,
        toUser: true,
        fromLocation: true,
        toLocation: true,
        process: true,
      },
      orderBy: {
        movementDate: "desc",
      },
      take: 10,
    });

    // Get work orders assigned to the user
    const assignedWorkOrders = await db.workOrder.findMany({
      where: {
        companyId: auth.companyId,
        assignedToId: auth.user.id,
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
      },
      include: {
        createdBy: true,
        maintenanceRecords: {
          include: {
            asset: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 10,
    });

    // Get upcoming maintenance for user's assigned assets
    const upcomingMaintenance = await db.maintenanceRecord.findMany({
      where: {
        companyId: auth.companyId,
        asset: {
          assignedToUserId: auth.user.id,
        },
        nextDueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
      include: {
        asset: true,
      },
      orderBy: {
        nextDueDate: "asc",
      },
      take: 10,
    });

    // Get recent audit logs for user's assets
    const recentActivity = await db.auditLog.findMany({
      where: {
        companyId: auth.companyId,
        OR: [
          { userId: auth.user.id },
          {
            asset: {
              assignedToUserId: auth.user.id,
            },
          },
        ],
      },
      include: {
        user: true,
        asset: true,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 10,
    });

    return {
      assignedAssets: assignedAssets.map((asset) => ({
        id: asset.id,
        assetTag: asset.assetTag,
        name: asset.name,
        category: asset.category,
        currentValue: asset.currentValue,
        status: asset.status,
        location: asset.location
          ? {
              id: asset.location.id,
              name: asset.location.name,
            }
          : null,
        assetType: asset.assetType
          ? {
              id: asset.assetType.id,
              name: asset.assetType.name,
            }
          : null,
        branch: asset.branch
          ? {
              id: asset.branch.id,
              name: asset.branch.name,
            }
          : null,
        department: asset.department
          ? {
              id: asset.department.id,
              name: asset.department.name,
            }
          : null,
      })),
      totalAssignedAssets: assignedAssets.length,
      totalAssignedValue,
      recentMovements: recentMovements.map((movement) => ({
        id: movement.id,
        movementDate: movement.movementDate,
        asset: {
          id: movement.asset.id,
          name: movement.asset.name,
          assetTag: movement.asset.assetTag,
        },
        fromUser: movement.fromUser
          ? {
              id: movement.fromUser.id,
              firstName: movement.fromUser.firstName,
              lastName: movement.fromUser.lastName,
            }
          : null,
        toUser: movement.toUser
          ? {
              id: movement.toUser.id,
              firstName: movement.toUser.firstName,
              lastName: movement.toUser.lastName,
            }
          : null,
        fromLocation: movement.fromLocation
          ? {
              id: movement.fromLocation.id,
              name: movement.fromLocation.name,
            }
          : null,
        toLocation: movement.toLocation
          ? {
              id: movement.toLocation.id,
              name: movement.toLocation.name,
            }
          : null,
        processType: movement.process.type,
        notes: movement.notes,
      })),
      assignedWorkOrders: assignedWorkOrders.map((workOrder) => ({
        id: workOrder.id,
        title: workOrder.title,
        description: workOrder.description,
        priority: workOrder.priority,
        status: workOrder.status,
        dueDate: workOrder.dueDate,
        createdBy: {
          firstName: workOrder.createdBy.firstName,
          lastName: workOrder.createdBy.lastName,
        },
        maintenanceRecords: workOrder.maintenanceRecords.map((record) => ({
          id: record.id,
          type: record.type,
          asset: {
            id: record.asset.id,
            name: record.asset.name,
            assetTag: record.asset.assetTag,
          },
        })),
      })),
      upcomingMaintenance: upcomingMaintenance.map((record) => ({
        id: record.id,
        type: record.type,
        description: record.description,
        nextDueDate: record.nextDueDate,
        asset: {
          id: record.asset.id,
          name: record.asset.name,
          assetTag: record.asset.assetTag,
        },
      })),
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        timestamp: log.timestamp,
        user: {
          firstName: log.user.firstName,
          lastName: log.user.lastName,
        },
        asset: log.asset
          ? {
              id: log.asset.id,
              name: log.asset.name,
              assetTag: log.asset.assetTag,
            }
          : null,
      })),
    };
  });
