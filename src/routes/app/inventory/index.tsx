import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, QrCode, ArrowRightLeft, Upload, Scan } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/inventory/")({
  component: InventoryPage,
});

function InventoryPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Scan,
      title: t("inventory.scanTitle"),
      description: t("inventory.scanSubtitle"),
      color: "from-blue-500 to-blue-600",
      href: "/app/inventory/scan",
    },
    {
      icon: Upload,
      title: t("inventory.initialInventory"),
      description: t("inventory.initialInventoryDescription"),
      color: "from-purple-500 to-purple-600",
      href: "/app/inventory/initial-inventory",
    },
    {
      icon: ArrowRightLeft,
      title: t("inventory.transferProcesses"),
      description: t("inventory.transferDescription"),
      color: "from-green-500 to-green-600",
      href: "/app/inventory/transfers",
    },
    {
      icon: QrCode,
      title: t("inventory.bulkPrintLabels"),
      description: t("inventory.bulkPrintDescription"),
      color: "from-orange-500 to-orange-600",
      href: "/app/inventory/bulk-print",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("inventory.title")}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("inventory.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const CardContent = (
              <>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </>
            );

            return (
              <Link
                key={index}
                to={feature.href}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
              >
                {CardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
