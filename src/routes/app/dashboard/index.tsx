import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/dashboard/")({
  component: DashboardRouter,
});

function DashboardRouter() {
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();

  const currentUserQuery = useQuery(
    trpc.getCurrentUser.queryOptions({
      authToken: authToken || "",
    })
  );

  if (currentUserQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentUserQuery.isError || !currentUserQuery.data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{t("dashboard.failedToLoad")}</p>
        </div>
      </div>
    );
  }

  const user = currentUserQuery.data;
  const permissions = user.permissions || [];

  // Check if user has admin or manager permissions
  const hasAdminAccess = permissions.some(
    (permission) =>
      permission.startsWith("admin.") ||
      permission === "assets.create" ||
      permission === "assets.edit" ||
      permission === "assets.delete" ||
      permission === "finance.depreciation" ||
      permission === "finance.reports"
  );

  // Route to appropriate dashboard
  if (hasAdminAccess) {
    return <Navigate to="/app/dashboard/admin" replace />;
  } else {
    return <Navigate to="/app/dashboard/employee" replace />;
  }
}
