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
  const [activeTab, setActiveTab] = useState<"distribution" | "depreciation" | "trends">("distribution");
  const [timeRange, setTimeRange] = useState(12);

  // Fetch data
  const distributionQuery = useQuery(
    trpc.getAssetDistribution.queryOptions({
      authToken: authToken || "",
    })
  );

  const depreciationQuery = useQuery(
    trpc.getDepreciationHistory.queryOptions({
      authToken: authToken || "",
    })
  );

  const trendsQuery = useQuery(
    trpc.getAssetValueTrends.queryOptions({
      authToken: authToken || "",
      months: timeRange,
    })
  );

  const tabs = [
    { id: "distribution" as const, label: t("finance.assetDistribution"), icon: PieChart },
    { id: "depreciation" as const, label: t("finance.depreciationSchedule"), icon: TrendingDown },
    { id: "trends" as const, label: t("finance.valueTrends"), icon: TrendingUp },
  ];

  const timeRangeOptions = [
    { value: 6, label: t("finance.sixMonths") },
    { value: 12, label: t("finance.twelveMonths") },
    { value: 24, label: t("finance.twentyFourMonths") },
    { value: 36, label: t("finance.thirtySixMonths") },
  ];

  const isLoading = distributionQuery.isLoading || depreciationQuery.isLoading || trendsQuery.isLoading;
  const hasError = distributionQuery.isError || depreciationQuery.isError || trendsQuery.isError;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("finance.title")}</h1>
            <p className="text-gray-600">
              {t("finance.subtitle")}
            </p>
          </div>
          
          {/* Time Range Selector */}
          {(activeTab === "depreciation" || activeTab === "trends") && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("finance.loadingFinancialData")}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">{t("finance.failedToLoadData")}</p>
          <p className="text-red-600 text-sm mt-1">{t("finance.tryRefreshing")}</p>
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
