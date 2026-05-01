import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  User,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/assets/")({
  component: AssetsListPage,
});

function AssetsListPage() {
  const { t } = useLanguage();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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
  const [assignedToFilter, setAssignedToFilter] = useState<number | undefined>(
    undefined,
  );

  const locationsQuery = useQuery(trpc.listLocations.queryOptions({}));

  const branchesQuery = useQuery(trpc.listBranches.queryOptions({}));

  const departmentsQuery = useQuery(
    trpc.listDepartments.queryOptions({
      branchId: branchFilter,
    }),
  );

  const assetTypesQuery = useQuery(trpc.listAssetTypes.queryOptions({}));

  const usersQuery = useQuery(trpc.listUsers.queryOptions({}));

  const assetsQuery = useQuery(
    trpc.listAssets.queryOptions({
      search: search || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      locationId: locationFilter,
      branchId: branchFilter,
      departmentId: departmentFilter,
      assetTypeId: assetTypeFilter,
      assignedToUserId: assignedToFilter,
    }),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
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
            {t("assets.title")}
          </h1>
          <p className="text-gray-600">{t("assets.subtitle")}</p>
        </div>
        <Link
          to="/app/assets/new"
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t("assets.addAsset")}
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("assets.filters")}
          </h2>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setCategoryFilter("");
              setLocationFilter(undefined);
              setBranchFilter(undefined);
              setDepartmentFilter(undefined);
              setAssetTypeFilter(undefined);
              setAssignedToFilter(undefined);
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {t("assets.clearAll")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.search")}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("assets.searchPlaceholder")}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.status")}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("assets.allStatuses")}</option>
                <option value="ACTIVE">{t("assets.statusActive")}</option>
                <option value="IN_REPAIR">{t("assets.statusInRepair")}</option>
                <option value="DISPOSED">{t("assets.statusDisposed")}</option>
                <option value="STOLEN">{t("assets.statusStolen")}</option>
                <option value="LOST">{t("assets.statusLost")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.category")}
            </label>
            <input
              type="text"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder={t("assets.categoryPlaceholder")}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.location")}
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
              <option value="">{t("assets.allLocations")}</option>
              {locationsQuery.data?.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.branch")}
            </label>
            <select
              value={branchFilter || ""}
              onChange={(e) => {
                setBranchFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                );
                setDepartmentFilter(undefined); // Reset department when branch changes
              }}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("assets.allBranches")}</option>
              {branchesQuery.data?.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} - {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.department")}
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
              <option value="">{t("assets.allDepartments")}</option>
              {departmentsQuery.data?.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.branch.code}-{department.code} - {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.assetType")}
            </label>
            <select
              value={assetTypeFilter || ""}
              onChange={(e) =>
                setAssetTypeFilter(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("assets.allTypes")}</option>
              {assetTypesQuery.data?.assetTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.code} - {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.assignedTo")}
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
              <option value="">{t("assets.allUsers")}</option>
              {usersQuery.data?.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assets List */}
      {assetsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      ) : assetsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{t("assets.failedToLoad")}</p>
        </div>
      ) : assetsQuery.data.assets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {t("assets.noAssetsFound")}
            </h3>
            <p className="mb-6 text-gray-600">{t("assets.noAssetsMessage")}</p>
            <Link
              to="/app/assets/new"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("assets.addFirstAsset")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("assets.asset")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("assets.category")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("assets.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("assets.value")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("assets.location")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("assets.assignedTo")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t("assets.actions")}
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
                      <div className="flex items-center">
                        {asset.photoUrl ? (
                          <img
                            src={asset.photoUrl}
                            alt={asset.name}
                            className="mr-3 h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                            <Plus className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.assetTag}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {asset.category}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          asset.status,
                        )}`}
                      >
                        {asset.status.replace("_", " ")}
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
                      {asset.currentAssignment ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="mr-1 h-4 w-4 text-gray-400" />
                          {asset.currentAssignment.user.firstName}{" "}
                          {asset.currentAssignment.user.lastName}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {t("assets.unassigned")}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to="/app/assets/$assetId"
                          params={{ assetId: asset.id.toString() }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to="/app/assets/$assetId/edit"
                          params={{ assetId: asset.id.toString() }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                      </div>
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
