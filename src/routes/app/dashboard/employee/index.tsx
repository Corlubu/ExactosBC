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
    trpc.getEmployeeDashboardStats.queryOptions({
      authToken: authToken || "",
    })
  );

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.employee.title")}</h1>
        <p className="text-gray-600">{t("dashboard.employee.subtitle")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">{t("dashboard.employee.myAssets")}</p>
          <p className="text-3xl font-bold">{stats.totalAssignedAssets}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">{t("dashboard.employee.totalValue")}</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalAssignedValue)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">{t("dashboard.employee.workOrders")}</p>
          <p className="text-3xl font-bold">{stats.assignedWorkOrders.length}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">{t("dashboard.employee.recentTransfers")}</p>
          <p className="text-3xl font-bold">{stats.recentMovements.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Assets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.employee.myAssignedAssets")}</h2>
            <Link
              to="/app/assets"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.assignedAssets.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("dashboard.employee.noAssetsAssigned")}</p>
              </div>
            ) : (
              stats.assignedAssets.slice(0, 5).map((asset) => (
                <Link
                  key={asset.id}
                  to="/app/assets"
                  search={{ assetTag: asset.assetTag }}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
                      <p className="text-xs text-gray-500">Tag: {asset.assetTag}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(asset.currentValue)}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 space-x-4">
                    {asset.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {asset.location.name}
                      </span>
                    )}
                    {asset.branch && (
                      <span className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.employee.workOrders")}</h2>
            <Link
              to="/app/maintenance"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.assignedWorkOrders.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("dashboard.employee.noWorkOrders")}</p>
              </div>
            ) : (
              stats.assignedWorkOrders.map((workOrder) => (
                <div
                  key={workOrder.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{workOrder.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{workOrder.description}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(
                        workOrder.priority
                      )}`}
                    >
                      {workOrder.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {workOrder.createdBy.firstName} {workOrder.createdBy.lastName}
                    </span>
                    {workOrder.dueDate && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {t("dashboard.employee.due")}: {formatDate(workOrder.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.employee.recentTransfers")}</h2>
            <Link
              to="/app/inventory/transfers"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentMovements.length === 0 ? (
              <div className="text-center py-8">
                <ArrowLeftRight className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("dashboard.employee.noRecentTransfers")}</p>
              </div>
            ) : (
              stats.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{movement.asset.name}</p>
                    <p className="text-xs text-gray-600">
                      {movement.fromUser && (
                        <span>
                          {t("dashboard.employee.from")}: {movement.fromUser.firstName} {movement.fromUser.lastName}
                        </span>
                      )}
                      {movement.toUser && (
                        <span>
                          {movement.fromUser && " → "}
                          {t("dashboard.employee.to")}: {movement.toUser.firstName} {movement.toUser.lastName}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(movement.movementDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.employee.upcomingMaintenance")}</h2>
            <Link
              to="/app/maintenance"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("dashboard.employee.viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingMaintenance.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("dashboard.employee.noUpcomingMaintenance")}</p>
              </div>
            ) : (
              stats.upcomingMaintenance.map((maintenance) => (
                <div key={maintenance.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{maintenance.asset.name}</p>
                    <p className="text-sm text-gray-600">{maintenance.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("dashboard.employee.due")}: {formatDate(maintenance.nextDueDate!)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.employee.recentActivity")}</h2>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("dashboard.employee.noRecentActivity")}</p>
              </div>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user.firstName} {activity.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.action} {activity.entityType.toLowerCase()}
                      {activity.asset && `: ${activity.asset.name}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
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
