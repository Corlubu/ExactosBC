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

  const dashboardQuery = useQuery(trpc.getDashboardStats.queryOptions({}));

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
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-600">{t("dashboard.admin.welcomeMessage")}</p>
      </div>

      {/* Metrics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <Package className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <p className="mb-1 text-sm font-medium text-blue-100">
            {t("dashboard.admin.totalAssets")}
          </p>
          <p className="text-3xl font-bold">{stats.totalAssets}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <DollarSign className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <p className="mb-1 text-sm font-medium text-green-100">
            {t("dashboard.admin.totalValue")}
          </p>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.totalValue)}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-purple-100">
            {t("dashboard.admin.acquisitionCost")}
          </p>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.totalAcquisitionCost)}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-orange-100">
            {t("dashboard.admin.totalDepreciation")}
          </p>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.totalDepreciation)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("dashboard.admin.quickActions")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/app/assets/new"
              className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("dashboard.admin.addAsset")}
            </Link>
            <Link
              to="/app/maintenance"
              className="flex items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Calendar className="mr-2 h-5 w-5" />
              {t("dashboard.admin.scheduleMaintenance")}
            </Link>
            <Link
              to="/app/inventory"
              className="flex items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Activity className="mr-2 h-5 w-5" />
              {t("dashboard.admin.startCounting")}
            </Link>
            <Link
              to="/app/finance"
              className="flex items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <DollarSign className="mr-2 h-5 w-5" />
              {t("dashboard.admin.generateReport")}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Assets by Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("dashboard.admin.assetsByStatus")}
          </h2>
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
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {translateStatus(status)}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("dashboard.admin.topCategories")}
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.assetsByCategory)
              .slice(0, 5)
              .map(([category, count]) => {
                const percentage = (count / stats.totalAssets) * 100;

                return (
                  <div key={category}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {category}
                      </span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("dashboard.admin.recentActivity")}
          </h2>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("dashboard.admin.noRecentActivity")}
              </p>
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

        {/* Upcoming Maintenance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("dashboard.admin.upcomingMaintenance")}
          </h2>
          <div className="space-y-4">
            {stats.upcomingMaintenance.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("dashboard.admin.noUpcomingMaintenance")}
              </p>
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
