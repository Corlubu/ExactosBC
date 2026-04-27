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
  const [locationFilter, setLocationFilter] = useState<number | undefined>(undefined);
  const [branchFilter, setBranchFilter] = useState<number | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [assetTypeFilter, setAssetTypeFilter] = useState<number | undefined>(undefined);
  const [assignedToFilter, setAssignedToFilter] = useState<number | undefined>(undefined);

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

  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      authToken: authToken || "",
    })
  );

  const assetsQuery = useQuery(
    trpc.listAssets.queryOptions({
      authToken: authToken || "",
      search: search || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      locationId: locationFilter,
      branchId: branchFilter,
      departmentId: departmentFilter,
      assetTypeId: assetTypeFilter,
      assignedToUserId: assignedToFilter,
    })
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("assets.title")}</h1>
          <p className="text-gray-600">{t("assets.subtitle")}</p>
        </div>
        <Link
          to="/app/assets/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t("assets.addAsset")}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t("assets.filters")}</h2>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.search")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("assets.searchPlaceholder")}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.status")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.category")}
            </label>
            <input
              type="text"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder={t("assets.categoryPlaceholder")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.location")}
            </label>
            <select
              value={locationFilter || ""}
              onChange={(e) => setLocationFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.branch")}
            </label>
            <select
              value={branchFilter || ""}
              onChange={(e) => {
                setBranchFilter(e.target.value ? parseInt(e.target.value) : undefined);
                setDepartmentFilter(undefined); // Reset department when branch changes
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.department")}
            </label>
            <select
              value={departmentFilter || ""}
              onChange={(e) => setDepartmentFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!branchFilter && departmentsQuery.data?.departments.length === 0}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.assetType")}
            </label>
            <select
              value={assetTypeFilter || ""}
              onChange={(e) => setAssetTypeFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assets.assignedTo")}
            </label>
            <select
              value={assignedToFilter || ""}
              onChange={(e) => setAssignedToFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : assetsQuery.isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{t("assets.failedToLoad")}</p>
        </div>
      ) : assetsQuery.data.assets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("assets.noAssetsFound")}</h3>
            <p className="text-gray-600 mb-6">
              {t("assets.noAssetsMessage")}
            </p>
            <Link
              to="/app/assets/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("assets.addFirstAsset")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("assets.asset")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("assets.category")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("assets.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("assets.value")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("assets.location")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("assets.assignedTo")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("assets.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assetsQuery.data.assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {asset.photoUrl ? (
                          <img
                            src={asset.photoUrl}
                            alt={asset.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <Plus className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset.name}
                          </div>
                          <div className="text-sm text-gray-500">{asset.assetTag}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          asset.status
                        )}`}
                      >
                        {asset.status.replace("_", " ")}
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
                      {asset.currentAssignment ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          {asset.currentAssignment.user.firstName}{" "}
                          {asset.currentAssignment.user.lastName}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{t("assets.unassigned")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to="/app/assets/$assetId"
                          params={{ assetId: asset.id.toString() }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to="/app/assets/$assetId/edit"
                          params={{ assetId: asset.id.toString() }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="w-5 h-5" />
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
