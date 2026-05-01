import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { z } from "zod";

const searchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  locationId: z.number().optional(),
  branchId: z.number().optional(),
  departmentId: z.number().optional(),
  assetTypeId: z.number().optional(),
  assetClassId: z.number().optional(),
  assignedToUserId: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const Route = createFileRoute("/app/reports/pdf-view/")({
  component: ReportPdfView,
  validateSearch: searchParamsSchema,
});

function ReportPdfView() {
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const searchParams = Route.useSearch();
  const { t, language } = useLanguage();

  // Fetch company settings for header
  const companyQuery = useQuery(trpc.getCompanySettings.queryOptions({}));

  // Fetch filtered assets
  const assetsQuery = useQuery(
    trpc.listAssetsForReport.queryOptions({
      search: searchParams.search,
      status: searchParams.status,
      locationId: searchParams.locationId,
      branchId: searchParams.branchId,
      departmentId: searchParams.departmentId,
      assetTypeId: searchParams.assetTypeId,
      assetClassId: searchParams.assetClassId,
      assignedToUserId: searchParams.assignedToUserId,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    }),
  );

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  // Helper function to translate status
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: t("status.active"),
      IN_REPAIR: t("status.inRepair"),
      DISPOSED: t("status.disposed"),
      STOLEN: t("status.stolen"),
      LOST: t("status.lost"),
    };
    return statusMap[status] || status;
  };

  if (assetsQuery.isLoading || companyQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">{t("reports.loadingReport")}</p>
        </div>
      </div>
    );
  }

  if (assetsQuery.isError || companyQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{t("reports.errorLoadingReport")}</p>
        </div>
      </div>
    );
  }

  const assets = assetsQuery.data.assets;
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalAcquisitionCost = assets.reduce(
    (sum, asset) => sum + asset.acquisitionCost,
    0,
  );

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8 border-b-2 border-gray-900 pb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {companyQuery.data.name || "Asset Management System"}
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          {t("reports.assetReport")}
        </h2>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>
              {t("reports.generated")}: {formatDate(new Date())}
            </p>
            {searchParams.startDate && searchParams.endDate && (
              <p>
                {t("reports.periodLabel")}:{" "}
                {formatDate(new Date(searchParams.startDate))} -{" "}
                {formatDate(new Date(searchParams.endDate))}
              </p>
            )}
          </div>
          <div className="text-right">
            <p>
              {t("reports.totalAssets")}:{" "}
              <span className="font-semibold">{assets.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mb-8 grid grid-cols-3 gap-6">
        <div className="rounded-lg border border-gray-300 p-4">
          <p className="mb-1 text-sm font-medium text-gray-600">
            {t("reports.totalAssets")}
          </p>
          <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
        </div>
        <div className="rounded-lg border border-gray-300 p-4">
          <p className="mb-1 text-sm font-medium text-gray-600">
            {t("reports.currentValue")}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-300 p-4">
          <p className="mb-1 text-sm font-medium text-gray-600">
            {t("reports.acquisitionCost")}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalAcquisitionCost)}
          </p>
        </div>
      </div>

      {/* Assets Table */}
      {assets.length === 0 ? (
        <div className="rounded-lg border border-gray-300 py-12 text-center">
          <p className="text-gray-600">{t("reports.noAssetsMatching")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.assetTag")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.name")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.typeClass")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.status")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.currentValue")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.location")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.branchDept")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-900">
                  {t("reports.custodian")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {asset.assetTag}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {asset.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{asset.assetType?.name || "-"}</div>
                    {asset.assetClass && (
                      <div className="text-xs text-gray-600">
                        {asset.assetClass.code}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {translateStatus(asset.status)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(asset.currentValue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {asset.location?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{asset.branch?.name || "-"}</div>
                    {asset.department && (
                      <div className="text-xs text-gray-600">
                        {asset.department.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {asset.currentAssignment
                      ? `${asset.currentAssignment.user.firstName} ${asset.currentAssignment.user.lastName}`
                      : t("reports.unassigned")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
        <p>
          {t("reports.reportContains")} {assets.length}{" "}
          {assets.length !== 1
            ? t("reports.assetPlural")
            : t("reports.assetSingular")}{" "}
          {t("reports.withTotalValue")} {formatCurrency(totalValue)}
        </p>
        <p className="mt-2">
          {companyQuery.data.name || "Asset Management System"} -{" "}
          {t("reports.confidential")}
        </p>
      </div>
    </div>
  );
}
