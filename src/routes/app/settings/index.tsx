import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, Users, Shield, Building, Database, Bell, MapPin, Folder, Tag } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Bell,
      title: t("settings.features.alertSettings.title"),
      description: t("settings.features.alertSettings.description"),
      color: "from-orange-500 to-orange-600",
      href: "/app/settings/alerts",
      available: true,
    },
    {
      icon: Building,
      title: t("settings.features.companySettings.title"),
      description: t("settings.features.companySettings.description"),
      color: "from-blue-500 to-blue-600",
      href: "/app/settings/company",
      available: true,
    },
    {
      icon: MapPin,
      title: t("settings.features.locations.title"),
      description: t("settings.features.locations.description"),
      color: "from-green-500 to-green-600",
      href: "/app/settings/locations",
      available: true,
    },
    {
      icon: MapPin,
      title: t("settings.features.branches.title"),
      description: t("settings.features.branches.description"),
      color: "from-teal-500 to-teal-600",
      href: "/app/settings/branches",
      available: true,
    },
    {
      icon: Folder,
      title: t("settings.features.departments.title"),
      description: t("settings.features.departments.description"),
      color: "from-indigo-500 to-indigo-600",
      href: "/app/settings/departments",
      available: true,
    },
    {
      icon: Tag,
      title: t("settings.features.assetTypes.title"),
      description: t("settings.features.assetTypes.description"),
      color: "from-pink-500 to-pink-600",
      href: "/app/settings/asset-types",
      available: true,
    },
    {
      icon: Tag,
      title: t("settings.features.assetClasses.title"),
      description: t("settings.features.assetClasses.description"),
      color: "from-rose-500 to-rose-600",
      href: "/app/settings/asset-classes",
      available: true,
    },
    {
      icon: Tag,
      title: t("settings.features.assetSubclasses.title"),
      description: t("settings.features.assetSubclasses.description"),
      color: "from-fuchsia-500 to-fuchsia-600",
      href: "/app/settings/asset-subclasses",
      available: true,
    },
    {
      icon: Tag,
      title: t("settings.features.labelSettings.title"),
      description: t("settings.features.labelSettings.description"),
      color: "from-purple-500 to-purple-600",
      href: "/app/settings/labels",
      available: true,
    },
    {
      icon: Users,
      title: t("settings.features.userManagement.title"),
      description: t("settings.features.userManagement.description"),
      color: "from-purple-500 to-purple-600",
      href: "/app/settings/users",
      available: true,
    },
    {
      icon: Shield,
      title: t("settings.features.rolesPermissions.title"),
      description: t("settings.features.rolesPermissions.description"),
      color: "from-green-500 to-green-600",
      href: "/app/settings/roles",
      available: true,
    },
    {
      icon: Database,
      title: t("settings.features.dataManagement.title"),
      description: t("settings.features.dataManagement.description"),
      color: "from-gray-500 to-gray-600",
      available: false,
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("settings.title")}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("settings.description")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            feature.available ? (
              <Link
                key={index}
                to={feature.href!}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                  {t("settings.configure")}
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ) : (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 opacity-60"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-gray-400">
                  {t("settings.comingSoon")}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
