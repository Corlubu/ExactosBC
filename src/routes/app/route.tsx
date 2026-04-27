import { createFileRoute, Outlet, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import {
  Building2,
  LayoutDashboard,
  Package,
  DollarSign,
  Wrench,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { AlertNotificationBell } from "~/components/AlertNotificationBell";
import { useLanguage } from "~/contexts/LanguageContext";
import { LanguageSelector } from "~/components/LanguageSelector";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const authToken = useAuthStore((state) => state.authToken);
  const clearAuthToken = useAuthStore((state) => state.clearAuthToken);
  const navigate = useNavigate();
  const trpc = useTRPC();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const navigation = [
    { name: t("nav.dashboard"), href: "/app/dashboard", icon: LayoutDashboard },
    { name: t("nav.assets"), href: "/app/assets", icon: Package },
    { name: t("nav.finance"), href: "/app/finance", icon: DollarSign },
    { name: t("nav.reports"), href: "/app/reports", icon: FileText },
    { name: t("nav.maintenance"), href: "/app/maintenance", icon: Wrench },
    { name: t("nav.inventory"), href: "/app/inventory", icon: ClipboardList },
    { name: t("nav.custodians"), href: "/app/custodians", icon: Users },
    { name: t("nav.settings"), href: "/app/settings", icon: Settings },
  ];

  const currentUserQuery = useQuery(
    trpc.getCurrentUser.queryOptions(
      { authToken: authToken || "" },
      { enabled: !!authToken }
    )
  );

  if (!authToken) {
    return <Navigate to="/login" />;
  }

  if (currentUserQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (currentUserQuery.isError) {
    clearAuthToken();
    return <Navigate to="/login" />;
  }

  const user = currentUserQuery.data;

  const handleLogout = () => {
    clearAuthToken();
    void navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform transition-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{t("app.assetMaster")}</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                activeProps={{ className: "bg-blue-50 text-blue-600 hover:bg-blue-50" }}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">{t("auth.logout")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-6 border-b border-gray-200 justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{t("app.assetMaster")}</span>
            </div>
            <AlertNotificationBell />
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  activeProps={{ className: "bg-blue-50 text-blue-600 hover:bg-blue-50" }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <LanguageSelector />
              <div className="mb-4 px-4">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.companyName}</p>
                {user?.role && (
                  <p className="text-xs text-gray-500 mt-1">{user.role.name}</p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">{t("auth.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar for mobile */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">{t("app.assetMaster")}</span>
            </div>
          </div>
          <AlertNotificationBell />
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
