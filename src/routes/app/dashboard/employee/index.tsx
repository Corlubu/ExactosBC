import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import {
  Package,
  DollarSign,
  ArrowLeftRight,
  Wrench,
  Activity,
  MapPin,
  Calendar,
  AlertCircle,
  User,
  Building,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/app/dashboard/employee/")({
  component: EmployeeDashboardPage,
});

function EmployeeDashboardPage() {
  const { t, language } = useLanguage();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  const dashboardQuery = useQuery(
    trpc.getEmployeeDashboardStats.queryOptions({}),
  );

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{t("dashboard.failedToLoad")}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardQuery.data;

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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {t("dashboard.employee.title")}
        </h1>
        <p className="text-gray-600">{t("dashboard.employee.subtitle")}</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-blue-100">
            {t("dashboard.employee.myAssets")}
          </p>
          <p className="text-3xl font-bold">{stats.totalAssignedAssets}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-green-100">
            {t("dashboard.employee.totalValue")}
          </p>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.totalAssignedValue)}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <Wrench className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-purple-100">
            {t("dashboard.employee.workOrders")}
          </p>
          <p className="text-3xl font-bold">
            {stats.assignedWorkOrders.length}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-orange-100">
            {t("dashboard.employee.recentTransfers")}
          </p>
          <p className="text-3xl font-bold">{stats.recentMovements.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Assigned Assets */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.employee.myAssignedAssets")}
            </h2>
            <Link
              to="/app/assets"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.assignedAssets.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {t("dashboard.employee.noAssetsAssigned")}
                </p>
              </div>
            ) : (
              stats.assignedAssets.slice(0, 5).map((asset) => (
                <Link
                  key={asset.id}
                  to="/app/assets"
                  search={{ assetTag: asset.assetTag }}
                  className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {asset.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tag: {asset.assetTag}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(asset.currentValue)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    {asset.location && (
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {asset.location.name}
                      </span>
                    )}
                    {asset.branch && (
                      <span className="flex items-center">
                        <Building className="mr-1 h-3 w-3" />
                        {asset.branch.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Work Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.employee.workOrders")}
            </h2>
            <Link
              to="/app/maintenance"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.assignedWorkOrders.length === 0 ? (
              <div className="py-8 text-center">
                <Wrench className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {t("dashboard.employee.noWorkOrders")}
                </p>
              </div>
            ) : (
              stats.assignedWorkOrders.map((workOrder) => (
                <div
                  key={workOrder.id}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {workOrder.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {workOrder.description}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${getPriorityColor(
                        workOrder.priority,
                      )}`}
                    >
                      {workOrder.priority}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      {workOrder.createdBy.firstName}{" "}
                      {workOrder.createdBy.lastName}
                    </span>
                    {workOrder.dueDate && (
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {t("dashboard.employee.due")}:{" "}
                        {formatDate(workOrder.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.employee.recentTransfers")}
            </h2>
            <Link
              to="/app/inventory/transfers"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentMovements.length === 0 ? (
              <div className="py-8 text-center">
                <ArrowLeftRight className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {t("dashboard.employee.noRecentTransfers")}
                </p>
              </div>
            ) : (
              stats.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <ArrowLeftRight className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {movement.asset.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {movement.fromUser && (
                        <span>
                          {t("dashboard.employee.from")}:{" "}
                          {movement.fromUser.firstName}{" "}
                          {movement.fromUser.lastName}
                        </span>
                      )}
                      {movement.toUser && (
                        <span>
                          {movement.fromUser && " → "}
                          {t("dashboard.employee.to")}:{" "}
                          {movement.toUser.firstName} {movement.toUser.lastName}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDateTime(movement.movementDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.employee.upcomingMaintenance")}
            </h2>
            <Link
              to="/app/maintenance"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingMaintenance.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {t("dashboard.employee.noUpcomingMaintenance")}
                </p>
              </div>
            ) : (
              stats.upcomingMaintenance.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="flex items-start space-x-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {maintenance.asset.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {maintenance.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t("dashboard.employee.due")}:{" "}
                      {formatDate(maintenance.nextDueDate!)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("dashboard.employee.recentActivity")}
          </h2>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {t("dashboard.employee.noRecentActivity")}
                </p>
              </div>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user.firstName} {activity.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.action} {activity.entityType.toLowerCase()}
                      {activity.asset && `: ${activity.asset.name}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
