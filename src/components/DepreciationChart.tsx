import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLanguage } from "~/contexts/LanguageContext";

interface DepreciationChartProps {
  data: {
    timeSeries: Array<{
      date: string;
      totalDepreciation: number;
      totalBookValue: number;
      totalAccumulatedDepreciation: number;
      count: number;
    }>;
    assetTrends: Array<{
      date: Date;
      assetId: number;
      assetName: string;
      depreciationAmount: number;
      bookValue: number;
      accumulatedDepreciation: number;
      method: string;
    }>;
    totalCalculations: number;
  };
}

export function DepreciationChart({ data }: DepreciationChartProps) {
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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
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
  
  if (data.timeSeries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{t("finance.noDepreciationData")}</p>
      </div>
    );
  }

  // Calculate summary stats
  const latestMonth = data.timeSeries[data.timeSeries.length - 1];
  const previousMonth = data.timeSeries.length > 1 ? data.timeSeries[data.timeSeries.length - 2] : null;
  const depreciationChange = previousMonth 
    ? ((latestMonth.totalDepreciation - previousMonth.totalDepreciation) / previousMonth.totalDepreciation) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">{t("finance.latestBookValue")}</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(latestMonth.totalBookValue)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatMonth(latestMonth.date)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">{t("finance.accumulatedDepreciation")}</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(latestMonth.totalAccumulatedDepreciation)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatMonth(latestMonth.date)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">{t("finance.monthlyDepreciation")}</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(latestMonth.totalDepreciation)}</p>
          {previousMonth && (
            <p className={`text-xs mt-1 ${depreciationChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {depreciationChange > 0 ? '+' : ''}{depreciationChange.toFixed(1)}% {t("finance.vsPreviousMonth")}
            </p>
          )}
        </div>
      </div>

      {/* Book Value Trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.bookValueOverTime")}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.timeSeries}>
            <defs>
              <linearGradient id="colorBookValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatMonth}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="totalBookValue" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorBookValue)"
              name={t("finance.bookValue")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Depreciation Trends */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.depreciationTrends")}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatMonth}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalDepreciation" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name={t("finance.monthlyDepreciation")}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalAccumulatedDepreciation" 
              stroke="#ef4444" 
              strokeWidth={2}
              name={t("finance.accumulatedDepreciation")}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("finance.depreciationSchedule")}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.period")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.assets")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.totalDepreciation")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.accumulated")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("finance.bookValue")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.timeSeries.slice().reverse().map((period, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatMonth(period.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {period.count}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {formatCurrency(period.totalDepreciation)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {formatCurrency(period.totalAccumulatedDepreciation)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                    {formatCurrency(period.totalBookValue)}
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
