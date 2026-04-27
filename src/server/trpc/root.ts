import {
  createCallerFactory,
  createTRPCRouter,
} from "~/server/trpc/main";
import { register } from "~/server/trpc/procedures/register";
import { login } from "~/server/trpc/procedures/login";
import { getCurrentUser } from "~/server/trpc/procedures/getCurrentUser";
import { getMinioBaseUrl } from "~/server/trpc/procedures/getMinioBaseUrl";
import { getPresignedUrl } from "~/server/trpc/procedures/getPresignedUrl";
import { listAssets } from "~/server/trpc/procedures/listAssets";
import { getAsset } from "~/server/trpc/procedures/getAsset";
import { getAssetByTag } from "~/server/trpc/procedures/getAssetByTag";
import { createAsset } from "~/server/trpc/procedures/createAsset";
import { updateAsset } from "~/server/trpc/procedures/updateAsset";
import { deleteAsset } from "~/server/trpc/procedures/deleteAsset";
import { generateAssetBarcode } from "~/server/trpc/procedures/generateAssetBarcode";
import { bulkImportAssets } from "~/server/trpc/procedures/bulkImportAssets";
import { getDashboardStats } from "~/server/trpc/procedures/getDashboardStats";
import { getEmployeeDashboardStats } from "~/server/trpc/procedures/getEmployeeDashboardStats";
import { listLocations } from "~/server/trpc/procedures/listLocations";
import { createLocation } from "~/server/trpc/procedures/createLocation";
import { updateLocation } from "~/server/trpc/procedures/updateLocation";
import { deleteLocation } from "~/server/trpc/procedures/deleteLocation";
import { listUsers } from "~/server/trpc/procedures/listUsers";
import { createUser } from "~/server/trpc/procedures/createUser";
import { updateUser } from "~/server/trpc/procedures/updateUser";
import { deleteUser } from "~/server/trpc/procedures/deleteUser";
import { updateUserCustodianDetails } from "~/server/trpc/procedures/updateUserCustodianDetails";
import { getAssetsByCustodian } from "~/server/trpc/procedures/getAssetsByCustodian";
import { generateCustodianCertificatePdf } from "~/server/trpc/procedures/generateCustodianCertificatePdf";
import { getAssetDistribution } from "~/server/trpc/procedures/getAssetDistribution";
import { getDepreciationHistory } from "~/server/trpc/procedures/getDepreciationHistory";
import { getAssetValueTrends } from "~/server/trpc/procedures/getAssetValueTrends";
import { createAlertSetting } from "~/server/trpc/procedures/createAlertSetting";
import { updateAlertSetting } from "~/server/trpc/procedures/updateAlertSetting";
import { deleteAlertSetting } from "~/server/trpc/procedures/deleteAlertSetting";
import { listAlertSettings } from "~/server/trpc/procedures/listAlertSettings";
import { checkDepreciationAlerts } from "~/server/trpc/procedures/checkDepreciationAlerts";
import { listAssetAlerts } from "~/server/trpc/procedures/listAssetAlerts";
import { markAlertAsRead } from "~/server/trpc/procedures/markAlertAsRead";
import { getCompanySettings } from "~/server/trpc/procedures/getCompanySettings";
import { updateCompanySettings } from "~/server/trpc/procedures/updateCompanySettings";
import { createTransferProcess } from "~/server/trpc/procedures/createTransferProcess";
import { addAssetsToTransfer } from "~/server/trpc/procedures/addAssetsToTransfer";
import { completeTransferProcess } from "~/server/trpc/procedures/completeTransferProcess";
import { cancelTransferProcess } from "~/server/trpc/procedures/cancelTransferProcess";
import { listTransferProcesses } from "~/server/trpc/procedures/listTransferProcesses";
import { getTransferProcess } from "~/server/trpc/procedures/getTransferProcess";
import { createBranch } from "~/server/trpc/procedures/createBranch";
import { listBranches } from "~/server/trpc/procedures/listBranches";
import { updateBranch } from "~/server/trpc/procedures/updateBranch";
import { deleteBranch } from "~/server/trpc/procedures/deleteBranch";
import { createDepartment } from "~/server/trpc/procedures/createDepartment";
import { listDepartments } from "~/server/trpc/procedures/listDepartments";
import { updateDepartment } from "~/server/trpc/procedures/updateDepartment";
import { deleteDepartment } from "~/server/trpc/procedures/deleteDepartment";
import { createAssetType } from "~/server/trpc/procedures/createAssetType";
import { listAssetTypes } from "~/server/trpc/procedures/listAssetTypes";
import { updateAssetType } from "~/server/trpc/procedures/updateAssetType";
import { deleteAssetType } from "~/server/trpc/procedures/deleteAssetType";
import { listPermissions } from "~/server/trpc/procedures/listPermissions";
import { createRole } from "~/server/trpc/procedures/createRole";
import { listRoles } from "~/server/trpc/procedures/listRoles";
import { updateRole } from "~/server/trpc/procedures/updateRole";
import { deleteRole } from "~/server/trpc/procedures/deleteRole";
import { createAssetClass } from "~/server/trpc/procedures/createAssetClass";
import { listAssetClasses } from "~/server/trpc/procedures/listAssetClasses";
import { updateAssetClass } from "~/server/trpc/procedures/updateAssetClass";
import { deleteAssetClass } from "~/server/trpc/procedures/deleteAssetClass";
import { createAssetSubclass } from "~/server/trpc/procedures/createAssetSubclass";
import { listAssetSubclasses } from "~/server/trpc/procedures/listAssetSubclasses";
import { updateAssetSubclass } from "~/server/trpc/procedures/updateAssetSubclass";
import { deleteAssetSubclass } from "~/server/trpc/procedures/deleteAssetSubclass";
import { generateBranchBarcode } from "~/server/trpc/procedures/generateBranchBarcode";
import { generateDepartmentBarcode } from "~/server/trpc/procedures/generateDepartmentBarcode";
import { generateLocationBarcode } from "~/server/trpc/procedures/generateLocationBarcode";
import { generateCustodianBarcode } from "~/server/trpc/procedures/generateCustodianBarcode";
import { listAssetsForReport } from "~/server/trpc/procedures/listAssetsForReport";
import { exportAssetsReport } from "~/server/trpc/procedures/exportAssetsReport";
import { exportAssetsReportPdf } from "~/server/trpc/procedures/exportAssetsReportPdf";
import { exportAssetsReportExcel } from "~/server/trpc/procedures/exportAssetsReportExcel";

export const appRouter = createTRPCRouter({
  // Authentication
  register,
  login,
  getCurrentUser,
  
  // Company
  getCompanySettings,
  updateCompanySettings,
  
  // Users
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserCustodianDetails,
  getAssetsByCustodian,
  generateCustodianCertificatePdf,
  
  // Roles & Permissions
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  
  // Assets
  listAssets,
  getAsset,
  getAssetByTag,
  createAsset,
  updateAsset,
  deleteAsset,
  generateAssetBarcode,
  bulkImportAssets,
  
  // Dashboard
  getDashboardStats,
  getEmployeeDashboardStats,
  
  // Locations
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  
  // Branches
  createBranch,
  listBranches,
  updateBranch,
  deleteBranch,
  
  // Departments
  createDepartment,
  listDepartments,
  updateDepartment,
  deleteDepartment,
  
  // Asset Types
  createAssetType,
  listAssetTypes,
  updateAssetType,
  deleteAssetType,
  
  // Asset Classes
  createAssetClass,
  listAssetClasses,
  updateAssetClass,
  deleteAssetClass,
  
  // Asset Subclasses
  createAssetSubclass,
  listAssetSubclasses,
  updateAssetSubclass,
  deleteAssetSubclass,
  
  // Finance & Analytics
  getAssetDistribution,
  getDepreciationHistory,
  getAssetValueTrends,
  
  // Alerts
  createAlertSetting,
  updateAlertSetting,
  deleteAlertSetting,
  listAlertSettings,
  checkDepreciationAlerts,
  listAssetAlerts,
  markAlertAsRead,
  
  // MinIO
  getMinioBaseUrl,
  getPresignedUrl,
  
  // Transfers & Reception
  createTransferProcess,
  addAssetsToTransfer,
  completeTransferProcess,
  cancelTransferProcess,
  listTransferProcesses,
  getTransferProcess,
  
  // Barcode Generation
  generateBranchBarcode,
  generateDepartmentBarcode,
  generateLocationBarcode,
  generateCustodianBarcode,
  
  // Reports
  listAssetsForReport,
  exportAssetsReport,
  exportAssetsReportPdf,
  exportAssetsReportExcel,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
