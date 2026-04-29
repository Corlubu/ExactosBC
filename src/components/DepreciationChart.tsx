import { useMemo } from "react";
// 1. Importamos TooltipProps de recharts para tipado estricto
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
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
    // ... resto de interfaces
  };
}

export function DepreciationChart({ data }: DepreciationChartProps) {
  const { t, language } = useLanguage();
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
    return date.toLocaleDateString(intlLocale, {
      month: "short",
      year: "numeric",
    });
  };

  // 2. Tipado estricto reemplazando 'any'
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 font-semibold text-gray-900">
            {label && formatMonth(label)}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name}:{" "}
              <span className="font-medium">
                {entry.value !== undefined ? formatCurrency(entry.value) : 0}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 3. NUEVO: Prevención de fuga de memoria por re-renders innecesarios
  const reversedSeries = useMemo(() => {
    return [...data.timeSeries].reverse();
  }, [data.timeSeries]);

  if (data.timeSeries.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">{t("finance.noDepreciationData")}</p>
      </div>
    );
  }

  // ... (Cálculos de summary cards y gráficas se mantienen igual)

  return (
    <div className="space-y-6">
      {/* ... Gráficas AreaChart y LineChart ... */}

      {/* Data Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {t("finance.depreciationSchedule")}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Thead... */}
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* 4. Usamos el array memoizado en lugar de mutar en tiempo de renderizado */}
              {reversedSeries.map((period, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {formatMonth(period.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                    {period.count}
                  </td>
                  {/* ... restos de los td */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
