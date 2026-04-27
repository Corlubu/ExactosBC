import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useLanguage } from "~/contexts/LanguageContext";

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
];

interface AssetDistributionChartProps {
  data: {
    byCategory: Array<{
      name: string;
      count: number;
      value: number;
      acquisitionCost: number;
      depreciation: number;
    }>;
    byStatus: Array<{
      name: string;
      count: number;
      value: number;
    }>;
    byLocation: Array<{
      name: string;
      count: number;
      value: number;
      locationId: number | null;
    }>;
    totals: {
      assets: number;
      value: number;
      acquisitionCost: number;
      depreciation: number;
    };
  };
}

export function AssetDistributionChart({ data }: AssetDistributionChartProps) {
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {t("common.count")}: <span className="font-medium">{payload[0].value}</span>
          </p>
          {payload[0].payload.value && (
            <p className="text-sm text-gray-600">
              {t("common.value")}: <span className="font-medium">{formatCurrency(payload[0].payload.value)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm font-medium mb-1">{t("finance.totalAssets")}</p>
          <p className="text-2xl font-bold">{data.totals.assets}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm font-medium mb-1">{t("finance.totalValue")}</p>
          <p className="text-2xl font-bold">{formatCurrency(data.totals.value)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-purple-100 text-sm font-medium mb-1">{t("finance.totalAcquisitionCost")}</p>
          <p className="text-2xl font-bold">{formatCurrency(data.totals.acquisitionCost)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-orange-100 text-sm font-medium mb-1">{t("finance.totalDepreciation")}</p>
          <p className="text-2xl font-bold">{formatCurrency(data.totals.depreciation)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets by Category - Count */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.assetsByCategory")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byCategory}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name} (${entry.count})`}
              >
                {data.byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assets by Category - Value */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.valueByCategory")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}`}
              >
                {data.byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-900">{payload[0].name}</p>
                        <p className="text-sm text-gray-600">
                          {t("finance.totalValue")}: <span className="font-medium">{formatCurrency(payload[0].value as number)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assets by Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.assetsByStatus")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.topLocationsByValue")}</h3>
          <div className="space-y-3">
            {data.byLocation.slice(0, 5).map((location, index) => {
              const percentage = (location.value / data.totals.value) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{location.name}</span>
                    <span className="text-sm text-gray-600">{formatCurrency(location.value)}</span>
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
      </div>

      {/* Category Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.categoryBreakdown")}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("assets.category")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.count")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.totalValue")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.totalAcquisitionCost")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.totalDepreciation")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.byCategory.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {category.count}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {formatCurrency(category.value)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {formatCurrency(category.acquisitionCost)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {formatCurrency(category.depreciation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
