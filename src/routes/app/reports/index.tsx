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
  const [locationFilter, setLocationFilter] = useState<number | undefined>(
    undefined,
  );
  const [branchFilter, setBranchFilter] = useState<number | undefined>(
    undefined,
  );
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(
    undefined,
  );
  const [assetTypeFilter, setAssetTypeFilter] = useState<number | undefined>(
    undefined,
  );
  const [assetClassFilter, setAssetClassFilter] = useState<number | undefined>(
    undefined,
  );
  const [assignedToFilter, setAssignedToFilter] = useState<number | undefined>(
    undefined,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch filter options
  const locationsQuery = useQuery(trpc.listLocations.queryOptions({}));

  const branchesQuery = useQuery(trpc.listBranches.queryOptions({}));

  const departmentsQuery = useQuery(
    trpc.listDepartments.queryOptions({
      branchId: branchFilter,
    }),
  );

  const assetTypesQuery = useQuery(trpc.listAssetTypes.queryOptions({}));

  const assetClassesQuery = useQuery(
    trpc.listAssetClasses.queryOptions({
      assetTypeId: assetTypeFilter,
    }),
  );

  const usersQuery = useQuery(trpc.listUsers.queryOptions({}));

  // Fetch filtered assets for display
  const assetsQuery = useQuery(
    trpc.listAssetsForReport.queryOptions({
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
    }),
  );

  // Export mutation
  const exportMutation = useMutation(
    trpc.exportAssetsReport.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          t("reports.reportGenerated") +
            ` ${data.recordCount} ` +
            t("reports.assetsExported"),
        );
        // Open download URL in new tab
        window.open(data.downloadUrl, "_blank");
      },
      onError: (error) => {
        toast.error(t("reports.failedToExport") + ` ${error.message}`);
      },
    }),
  );

  const handleExport = () => {
    exportMutation.mutate({
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
    }),
  );

  const handleExportPdf = () => {
    exportPdfMutation.mutate({
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
        toast.success(
          t("reports.excelGenerated") +
            ` ${data.recordCount} ` +
            t("reports.assetsExported"),
        );
        // Open download URL in new tab
        window.open(data.downloadUrl, "_blank");
      },
      onError: (error) => {
        toast.error(t("reports.failedToExportExcel") + ` ${error.message}`);
      },
    }),
  );

  const handleExportExcel = () => {
    exportExcelMutation.mutate({
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
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t("reports.title")}
          </h1>
          <p className="text-gray-600">{t("reports.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending || assetsQuery.isLoading}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportMutation.isPending ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                {t("reports.exporting")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                {t("reports.exportCSV")}
              </>
            )}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportPdfMutation.isPending || assetsQuery.isLoading}
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportPdfMutation.isPending ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                {t("reports.generating")}
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-5 w-5" />
                {t("reports.exportPDF")}
              </>
            )}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportExcelMutation.isPending || assetsQuery.isLoading}
            className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportExcelMutation.isPending ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                {t("reports.generating")}
              </>
            ) : (
              <>
                <Sheet className="mr-2 h-5 w-5" />
                {t("reports.exportExcel")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("reports.filters")}
            </h2>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {t("reports.clearAll")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.search")}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("reports.searchPlaceholder")}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.status")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.branch")}
            </label>
            <select
              value={branchFilter || ""}
              onChange={(e) => {
                setBranchFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                );
                setDepartmentFilter(undefined);
              }}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.department")}
            </label>
            <select
              value={departmentFilter || ""}
              onChange={(e) =>
                setDepartmentFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              disabled={
                !branchFilter && departmentsQuery.data?.departments.length === 0
              }
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.assetType")}
            </label>
            <select
              value={assetTypeFilter || ""}
              onChange={(e) => {
                setAssetTypeFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                );
                setAssetClassFilter(undefined);
              }}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.assetClass")}
            </label>
            <select
              value={assetClassFilter || ""}
              onChange={(e) =>
                setAssetClassFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              disabled={
                !assetTypeFilter &&
                assetClassesQuery.data?.assetClasses.length === 0
              }
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.location")}
            </label>
            <select
              value={locationFilter || ""}
              onChange={(e) =>
                setLocationFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("reports.custodian")}
            </label>
            <select
              value={assignedToFilter || ""}
              onChange={(e) =>
                setAssignedToFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <Calendar className="mr-1 inline h-4 w-4" />
              {t("reports.startDate")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <Calendar className="mr-1 inline h-4 w-4" />
              {t("reports.endDate")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {assetsQuery.data && (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("reports.totalAssets")}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {assetsQuery.data.assets.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("reports.totalValue")}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    assetsQuery.data.assets.reduce(
                      (sum, asset) => sum + asset.currentValue,
                      0,
                    ),
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("reports.acquisitionCost")}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    assetsQuery.data.assets.reduce(
                      (sum, asset) => sum + asset.acquisitionCost,
                      0,
                    ),
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Table */}
      {assetsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t("reports.loadingAssets")}</p>
          </div>
        </div>
      ) : assetsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{t("reports.failedToLoad")}</p>
        </div>
      ) : assetsQuery.data.assets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {t("reports.noAssetsFound")}
            </h3>
            <p className="text-gray-600">{t("reports.adjustFilters")}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.asset")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.typeClass")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.value")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.location")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.branchDept")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.custodian")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("reports.acquisitionDate")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {assetsQuery.data.assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {asset.assetTag}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {asset.assetType?.name || "-"}
                      </div>
                      {asset.assetClass && (
                        <div className="text-xs text-gray-500">
                          {asset.assetClass.code}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          asset.status,
                        )}`}
                      >
                        {translateStatus(asset.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(asset.currentValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("reports.cost")}:{" "}
                        {formatCurrency(asset.acquisitionCost)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {asset.location ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                          {asset.location.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {asset.branch?.name || "-"}
                      </div>
                      {asset.department && (
                        <div className="text-xs text-gray-500">
                          {asset.department.name}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {asset.currentAssignment ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="mr-1 h-4 w-4 text-gray-400" />
                          {asset.currentAssignment.user.firstName}{" "}
                          {asset.currentAssignment.user.lastName}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {t("reports.unassigned")}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
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
