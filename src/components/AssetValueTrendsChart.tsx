import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLanguage } from "~/contexts/LanguageContext";

interface AssetValueTrendsChartProps {
  data: {
    trends: Array<{
      month: string;
      totalBookValue: number;
      totalAcquisitionCost: number;
      totalDepreciation: number;
      assetCount: number;
      categories: Array<{
        name: string;
        value: number;
      }>;
    }>;
    currentSnapshot: {
      totalAssets: number;
      totalCurrentValue: number;
      totalAcquisitionCost: number;
      totalDepreciation: number;
      byCategory: Record<string, {
        count: number;
        currentValue: number;
        acquisitionCost: number;
      }>;
    };
  };
}

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
];

export function AssetValueTrendsChart({ data }: AssetValueTrendsChartProps) {
  const { t, language } = useLanguage();
  
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

  const formatMonth = (dateString: string) => {
    const [year, month] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(intlLocale, { month: "short", year: "numeric" });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{formatMonth(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name}: <span className="font-medium">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  if (data.trends.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{t("finance.noTrendData")}</p>
      </div>
    );
  }

  // Calculate value change
  const firstMonth = data.trends[0];
  const lastMonth = data.trends[data.trends.length - 1];
  const valueChange = lastMonth.totalBookValue - firstMonth.totalBookValue;
  const valueChangePercent = (valueChange / firstMonth.totalBookValue) * 100;

  // Prepare data for category breakdown chart
  const categoryBreakdown = Object.entries(data.currentSnapshot.byCategory)
    .map(([name, values]) => ({
      name,
      ...values,
    }))
    .sort((a, b) => b.currentValue - a.currentValue);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">{t("finance.currentPortfolioValue")}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.currentSnapshot.totalCurrentValue)}
          </p>
          <p className={`text-xs mt-1 ${valueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {valueChange >= 0 ? '+' : ''}{formatCurrency(valueChange)} ({valueChangePercent.toFixed(1)}%)
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">{t("finance.totalAcquisitionCost")}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.currentSnapshot.totalAcquisitionCost)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t("finance.originalInvestment")}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">{t("finance.totalDepreciation")}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.currentSnapshot.totalDepreciation)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {((data.currentSnapshot.totalDepreciation / data.currentSnapshot.totalAcquisitionCost) * 100).toFixed(1)}% {t("finance.ofCost")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">{t("finance.count")}</p>
          <p className="text-2xl font-bold text-gray-900">{data.currentSnapshot.totalAssets}</p>
          <p className="text-xs text-gray-500 mt-1">{t("finance.activeAssets")}</p>
        </div>
      </div>

      {/* Value Trend Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.portfolioValueTrend")}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.trends}>
            <defs>
              <linearGradient id="colorAcquisition" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorBookValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="totalAcquisitionCost" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorAcquisition)"
              name={t("finance.totalAcquisitionCost")}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="totalBookValue" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorBookValue)"
              name={t("finance.bookValue")}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.valueByCategory")}</h3>
        <div className="space-y-4">
          {categoryBreakdown.map((category, index) => {
            const percentage = (category.currentValue / data.currentSnapshot.totalCurrentValue) * 100;
            const depreciationPercent = ((category.acquisitionCost - category.currentValue) / category.acquisitionCost) * 100;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({category.count} {t("finance.assets").toLowerCase()})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(category.currentValue)}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}% {t("finance.ofPortfolio")}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{t("finance.acquisition")}: {formatCurrency(category.acquisitionCost)}</span>
                  <span className="text-orange-600">{t("finance.depreciated")}: {depreciationPercent.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
