import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { TrendingUp, PieChart, TrendingDown, Calendar } from "lucide-react";
import { AssetDistributionChart } from "~/components/AssetDistributionChart";
import { DepreciationChart } from "~/components/DepreciationChart";
import { AssetValueTrendsChart } from "~/components/AssetValueTrendsChart";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/finance/")({
  component: FinancePage,
});

function FinancePage() {
  const { t } = useLanguage();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [activeTab, setActiveTab] = useState<
    "distribution" | "depreciation" | "trends"
  >("distribution");
  const [timeRange, setTimeRange] = useState(12);

  // Fetch data
  const distributionQuery = useQuery(
    trpc.getAssetDistribution.queryOptions({}),
  );

  const depreciationQuery = useQuery(
    trpc.getDepreciationHistory.queryOptions({}),
  );

  const trendsQuery = useQuery(
    trpc.getAssetValueTrends.queryOptions({
      months: timeRange,
    }),
  );

  const tabs = [
    {
      id: "distribution" as const,
      label: t("finance.assetDistribution"),
      icon: PieChart,
    },
    {
      id: "depreciation" as const,
      label: t("finance.depreciationSchedule"),
      icon: TrendingDown,
    },
    {
      id: "trends" as const,
      label: t("finance.valueTrends"),
      icon: TrendingUp,
    },
  ];

  const timeRangeOptions = [
    { value: 6, label: t("finance.sixMonths") },
    { value: 12, label: t("finance.twelveMonths") },
    { value: 24, label: t("finance.twentyFourMonths") },
    { value: 36, label: t("finance.thirtySixMonths") },
  ];

  const isLoading =
    distributionQuery.isLoading ||
    depreciationQuery.isLoading ||
    trendsQuery.isLoading;
  const hasError =
    distributionQuery.isError ||
    depreciationQuery.isError ||
    trendsQuery.isError;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {t("finance.title")}
            </h1>
            <p className="text-gray-600">{t("finance.subtitle")}</p>
          </div>

          {/* Time Range Selector */}
          {(activeTab === "depreciation" || activeTab === "trends") && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } `}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t("finance.loadingFinancialData")}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">
            {t("finance.failedToLoadData")}
          </p>
          <p className="mt-1 text-sm text-red-600">
            {t("finance.tryRefreshing")}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !hasError && (
        <>
          {activeTab === "distribution" && distributionQuery.data && (
            <AssetDistributionChart data={distributionQuery.data} />
          )}

          {activeTab === "depreciation" && depreciationQuery.data && (
            <DepreciationChart data={depreciationQuery.data} />
          )}

          {activeTab === "trends" && trendsQuery.data && (
            <AssetValueTrendsChart data={trendsQuery.data} />
          )}
        </>
      )}
    </div>
  );
}
