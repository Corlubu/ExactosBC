import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { useState } from "react";
import {
  Download,
  Search,
  Filter,
  FileText,
  Calendar,
  MapPin,
  User,
  FileDown,
  Sheet,
} from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/app/reports/")({
  component: ReportsPage,
});

function ReportsPage() {
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t, language } = useLanguage();
  
  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState<number | undefined>(undefined);
  const [branchFilter, setBranchFilter] = useState<number | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [assetTypeFilter, setAssetTypeFilter] = useState<number | undefined>(undefined);
  const [assetClassFilter, setAssetClassFilter] = useState<number | undefined>(undefined);
  const [assignedToFilter, setAssignedToFilter] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch filter options
  const locationsQuery = useQuery(
    trpc.listLocations.queryOptions({
      authToken: authToken || "",
    })
  );

  const branchesQuery = useQuery(
    trpc.listBranches.queryOptions({
      authToken: authToken || "",
    })
  );

  const departmentsQuery = useQuery(
    trpc.listDepartments.queryOptions({
      authToken: authToken || "",
      branchId: branchFilter,
    })
  );

  const assetTypesQuery = useQuery(
    trpc.listAssetTypes.queryOptions({
      authToken: authToken || "",
    })
  );

  const assetClassesQuery = useQuery(
    trpc.listAssetClasses.queryOptions({
      authToken: authToken || "",
      assetTypeId: assetTypeFilter,
    })
  );

  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      authToken: authToken || "",
    })
  );

  // Fetch filtered assets for display
  const assetsQuery = useQuery(
    trpc.listAssetsForReport.queryOptions({
      authToken: authToken || "",
      search: search || undefined,
      status: statusFilter || undefined,
      locationId: locationFilter,
      branchId: branchFilter,
      departmentId: departmentFilter,
      assetTypeId: assetTypeFilter,
      assetClassId: assetClassFilter,
      assignedToUserId: assignedToFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  );

  // Export mutation
  const exportMutation = useMutation(
    trpc.exportAssetsReport.mutationOptions({
      onSuccess: (data) => {
        toast.success(t("reports.reportGenerated") + ` ${data.recordCount} ` + t("reports.assetsExported"));
        // Open download URL in new tab
        window.open(data.downloadUrl, "_blank");
      },
      onError: (error) => {
        toast.error(t("reports.failedToExport") + ` ${error.message}`);
      },
    })
  );

  const handleExport = () => {
    exportMutation.mutate({
      authToken: authToken || "",
      search: search || undefined,
      status: statusFilter || undefined,
      locationId: locationFilter,
      branchId: branchFilter,
      departmentId: departmentFilter,
      assetTypeId: assetTypeFilter,
      assetClassId: assetClassFilter,
      assignedToUserId: assignedToFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  // Export PDF mutation
  const exportPdfMutation = useMutation(
    trpc.exportAssetsReportPdf.mutationOptions({
      onSuccess: (data) => {
        toast.success(t("reports.pdfGenerated"));
        // Open download URL in new tab
        window.open(data.downloadUrl, "_blank");
      },
      onError: (error) => {
        toast.error(t("reports.failedToGeneratePDF") + ` ${error.message}`);
      },
    })
  );

  const handleExportPdf = () => {
    exportPdfMutation.mutate({
      authToken: authToken || "",
      search: search || undefined,
      status: statusFilter || undefined,
      locationId: locationFilter,
      branchId: branchFilter,
      departmentId: departmentFilter,
      assetTypeId: assetTypeFilter,
      assetClassId: assetClassFilter,
      assignedToUserId: assignedToFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  // Export Excel mutation
  const exportExcelMutation = useMutation(
    trpc.exportAssetsReportExcel.mutationOptions({
      onSuccess: (data) => {
        toast.success(t("reports.excelGenerated") + ` ${data.recordCount} ` + t("reports.assetsExported"));
        // Open download URL in new tab
        window.open(data.downloadUrl, "_blank");
      },
      onError: (error) => {
        toast.error(t("reports.failedToExportExcel") + ` ${error.message}`);
      },
    })
  );

  const handleExportExcel = () => {
    exportExcelMutation.mutate({
      authToken: authToken || "",
      search: search || undefined,
      status: statusFilter || undefined,
      locationId: locationFilter,
      branchId: branchFilter,
      departmentId: departmentFilter,
      assetTypeId: assetTypeFilter,
      assetClassId: assetClassFilter,
      assignedToUserId: assignedToFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setLocationFilter(undefined);
    setBranchFilter(undefined);
    setDepartmentFilter(undefined);
    setAssetTypeFilter(undefined);
    setAssetClassFilter(undefined);
    setAssignedToFilter(undefined);
    setStartDate("");
    setEndDate("");
  };

  // Map locale to Intl locale
  const intlLocale = language === "es" ? "es-ES" : "en-US";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  // Helper function to translate status
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: t("status.active"),
      IN_REPAIR: t("status.inRepair"),
      DISPOSED: t("status.disposed"),
      STOLEN: t("status.stolen"),
      LOST: t("status.lost"),
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      IN_REPAIR: "bg-yellow-100 text-yellow-800",
      DISPOSED: "bg-gray-100 text-gray-800",
      STOLEN: "bg-red-100 text-red-800",
      LOST: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-blue-100 text-blue-800";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("reports.title")}</h1>
          <p className="text-gray-600">
            {t("reports.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending || assetsQuery.isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t("reports.exporting")}
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                {t("reports.exportCSV")}
              </>
            )}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportPdfMutation.isPending || assetsQuery.isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportPdfMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t("reports.generating")}
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5 mr-2" />
                {t("reports.exportPDF")}
              </>
            )}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportExcelMutation.isPending || assetsQuery.isLoading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportExcelMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t("reports.generating")}
              </>
            ) : (
              <>
                <Sheet className="w-5 h-5 mr-2" />
                {t("reports.exportExcel")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">{t("reports.filters")}</h2>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t("reports.clearAll")}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.search")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("reports.searchPlaceholder")}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.status")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("reports.allStatuses")}</option>
              <option value="ACTIVE">{t("assets.statusActive")}</option>
              <option value="IN_REPAIR">{t("assets.statusInRepair")}</option>
              <option value="DISPOSED">{t("assets.statusDisposed")}</option>
              <option value="STOLEN">{t("assets.statusStolen")}</option>
              <option value="LOST">{t("assets.statusLost")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.branch")}
            </label>
            <select
              value={branchFilter || ""}
              onChange={(e) => {
                setBranchFilter(e.target.value ? parseInt(e.target.value) : undefined);
                setDepartmentFilter(undefined);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("reports.allBranches")}</option>
              {branchesQuery.data?.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} - {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.department")}
            </label>
            <select
              value={departmentFilter || ""}
              onChange={(e) => setDepartmentFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!branchFilter && departmentsQuery.data?.departments.length === 0}
            >
              <option value="">{t("reports.allDepartments")}</option>
              {departmentsQuery.data?.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.branch.code}-{department.code} - {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.assetType")}
            </label>
            <select
              value={assetTypeFilter || ""}
              onChange={(e) => {
                setAssetTypeFilter(e.target.value ? parseInt(e.target.value) : undefined);
                setAssetClassFilter(undefined);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("reports.allTypes")}</option>
              {assetTypesQuery.data?.assetTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.code} - {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.assetClass")}
            </label>
            <select
              value={assetClassFilter || ""}
              onChange={(e) => setAssetClassFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!assetTypeFilter && assetClassesQuery.data?.assetClasses.length === 0}
            >
              <option value="">{t("reports.allClasses")}</option>
              {assetClassesQuery.data?.assetClasses.map((assetClass) => (
                <option key={assetClass.id} value={assetClass.id}>
                  {assetClass.code} - {assetClass.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.location")}
            </label>
            <select
              value={locationFilter || ""}
              onChange={(e) => setLocationFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("reports.allLocations")}</option>
              {locationsQuery.data?.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reports.custodian")}
            </label>
            <select
              value={assignedToFilter || ""}
              onChange={(e) => setAssignedToFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("reports.allCustodians")}</option>
              {usersQuery.data?.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {t("reports.startDate")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {t("reports.endDate")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {assetsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("reports.totalAssets")}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {assetsQuery.data.assets.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("reports.totalValue")}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    assetsQuery.data.assets.reduce((sum, asset) => sum + asset.currentValue, 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("reports.acquisitionCost")}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    assetsQuery.data.assets.reduce((sum, asset) => sum + asset.acquisitionCost, 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Table */}
      {assetsQuery.isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("reports.loadingAssets")}</p>
          </div>
        </div>
      ) : assetsQuery.isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{t("reports.failedToLoad")}</p>
        </div>
      ) : assetsQuery.data.assets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("reports.noAssetsFound")}</h3>
            <p className="text-gray-600">
              {t("reports.adjustFilters")}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.asset")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.typeClass")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.value")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.location")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.branchDept")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.custodian")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.acquisitionDate")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assetsQuery.data.assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500">{asset.assetTag}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {asset.assetType?.name || "-"}
                      </div>
                      {asset.assetClass && (
                        <div className="text-xs text-gray-500">
                          {asset.assetClass.code}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          asset.status
                        )}`}
                      >
                        {translateStatus(asset.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(asset.currentValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("reports.cost")}: {formatCurrency(asset.acquisitionCost)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.location ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {asset.location.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {asset.branch?.name || "-"}
                      </div>
                      {asset.department && (
                        <div className="text-xs text-gray-500">
                          {asset.department.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.currentAssignment ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          {asset.currentAssignment.user.firstName}{" "}
                          {asset.currentAssignment.user.lastName}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{t("reports.unassigned")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(asset.acquisitionDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
