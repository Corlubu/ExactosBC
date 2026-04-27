import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import {
  TrendingUp,
  Package,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Plus,
  Calendar,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/app/dashboard/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t, language } = useLanguage();

  const dashboardQuery = useQuery(
    trpc.getDashboardStats.queryOptions({
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.title")}</h1>
        <p className="text-gray-600">{t("dashboard.admin.welcomeMessage")}</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Package className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">{t("dashboard.admin.totalAssets")}</p>
          <p className="text-3xl font-bold">{stats.totalAssets}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">{t("dashboard.admin.totalValue")}</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">{t("dashboard.admin.acquisitionCost")}</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalAcquisitionCost)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">{t("dashboard.admin.totalDepreciation")}</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalDepreciation)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.admin.quickActions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/app/assets/new"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("dashboard.admin.addAsset")}
            </Link>
            <Link
              to="/app/maintenance"
              className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {t("dashboard.admin.scheduleMaintenance")}
            </Link>
            <Link
              to="/app/inventory"
              className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Activity className="w-5 h-5 mr-2" />
              {t("dashboard.admin.startCounting")}
            </Link>
            <Link
              to="/app/finance"
              className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {t("dashboard.admin.generateReport")}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets by Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.admin.assetsByStatus")}</h2>
          <div className="space-y-4">
            {Object.entries(stats.assetsByStatus).map(([status, count]) => {
              const percentage = (count / stats.totalAssets) * 100;
              const statusColors: Record<string, string> = {
                ACTIVE: "bg-green-500",
                IN_REPAIR: "bg-yellow-500",
                DISPOSED: "bg-gray-500",
                STOLEN: "bg-red-500",
                LOST: "bg-orange-500",
              };
              const color = statusColors[status] || "bg-blue-500";

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {translateStatus(status)}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assets by Category */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.admin.topCategories")}</h2>
          <div className="space-y-4">
            {Object.entries(stats.assetsByCategory).slice(0, 5).map(([category, count]) => {
              const percentage = (count / stats.totalAssets) * 100;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.admin.recentActivity")}</h2>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">{t("dashboard.admin.noRecentActivity")}</p>
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
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.admin.upcomingMaintenance")}</h2>
          <div className="space-y-4">
            {stats.upcomingMaintenance.length === 0 ? (
              <p className="text-gray-500 text-sm">{t("dashboard.admin.noUpcomingMaintenance")}</p>
            ) : (
              stats.upcomingMaintenance.map((maintenance) => (
                <div key={maintenance.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {maintenance.asset.name}
                    </p>
                    <p className="text-sm text-gray-600">{maintenance.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {formatDate(maintenance.nextDueDate!)}
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
