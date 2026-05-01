import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { Link } from "@tanstack/react-router";
import { Bell, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useLanguage } from "~/contexts/LanguageContext";

export function AlertNotificationBell() {
  const authToken = useAuthStore((state) => state.authToken);
  const trpc = useTRPC();
  const { t, language } = useLanguage();

  // Map locale to Intl locale
  const intlLocale = language === "es" ? "es-ES" : "en-US";

  const activeAlertsQuery = useQuery(
    trpc.listAssetAlerts.queryOptions({
      status: "ACTIVE",
      limit: 5,
    }),
  );

  const activeCount = activeAlertsQuery.data?.activeCount || 0;
  const recentAlerts = activeAlertsQuery.data?.alerts || [];

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "DEPRECIATION_MILESTONE":
        return <TrendingDown className="h-4 w-4" />;
      case "BOOK_VALUE_THRESHOLD":
        return <AlertTriangle className="h-4 w-4" />;
      case "FULLY_DEPRECIATED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
        <Bell className="h-5 w-5" />
        {activeCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {activeCount > 9 ? "9+" : activeCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {t("settings.alerts.title")}
            </h3>
            {activeCount > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {activeCount} {t("settings.alerts.activeAlerts").toLowerCase()}
              </p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <div className="p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
                <p className="text-sm text-gray-500">
                  {t("settings.alerts.activeAlerts")}
                </p>
              </div>
            ) : (
              <div className="py-2">
                {recentAlerts.map((alert) => (
                  <Menu.Item key={alert.id}>
                    {({ active }) => (
                      <Link
                        to="/app/settings/alerts"
                        className={`block border-b border-gray-100 px-4 py-3 last:border-b-0 ${
                          active ? "bg-gray-50" : ""
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mt-0.5 flex-shrink-0 text-orange-600">
                            {getAlertTypeIcon(alert.alertType)}
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-medium text-gray-900">
                              {alert.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {alert.asset.name} •{" "}
                              {new Date(alert.triggeredAt).toLocaleDateString(
                                intlLocale,
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3">
            <Link
              to="/app/settings/alerts"
              className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t("settings.alerts.viewAsset")}
            </Link>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
