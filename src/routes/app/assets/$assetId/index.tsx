import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { ArrowLeft, Printer, User, MapPin, Calendar, DollarSign, Package } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/app/assets/$assetId/")({
  component: AssetDetailPage,
});

function AssetDetailPage() {
  const navigate = useNavigate();
  const { assetId } = Route.useParams();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();

  const assetQuery = useQuery(
    trpc.getAsset.queryOptions({
      authToken: authToken || "",
      assetId: parseInt(assetId),
    })
  );

  const generateBarcodeMutation = useMutation(
    trpc.generateAssetBarcode.mutationOptions({
      onSuccess: () => {
        toast.success(t("assets.barcodeGenerated"));
        void assetQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("assets.failedToGenerateBarcode"));
      },
    })
  );

  const handlePrintBarcode = () => {
    if (!assetQuery.data?.qrCodeUrl) {
      toast.error(t("assets.noBarcodeToPrint"));
      return;
    }

    // Open a new window with just the barcode for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Barcode - ${assetQuery.data.assetTag}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .barcode-container {
                text-align: center;
                page-break-inside: avoid;
              }
              .barcode-image {
                max-width: 300px;
                margin: 20px auto;
                display: block;
              }
              .asset-tag {
                font-size: 24px;
                font-weight: bold;
                margin-top: 10px;
              }
              .asset-name {
                font-size: 18px;
                color: #666;
                margin-top: 5px;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <img src="${assetQuery.data.qrCodeUrl}" alt="Asset Barcode" class="barcode-image" />
              <div class="asset-tag">${assetQuery.data.assetTag}</div>
              <div class="asset-name">${assetQuery.data.name}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleRegenerateBarcode = () => {
    if (!authToken) return;
    generateBarcodeMutation.mutate({
      authToken,
      assetId: parseInt(assetId),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      IN_REPAIR: "bg-yellow-100 text-yellow-800",
      DISPOSED: "bg-gray-100 text-gray-800",
      STOLEN: "bg-red-100 text-red-800",
      LOST: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-blue-100 text-blue-800";
  };

  if (assetQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (assetQuery.isError || !assetQuery.data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{t("assets.failedToLoad")}</p>
        </div>
      </div>
    );
  }

  const asset = assetQuery.data;
  const currentAssignment = asset.assignments.find((a) => !a.endDate);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/assets" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("assets.backToAssets")}
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{asset.name}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{t("assets.assetTag")}: <span className="font-semibold">{asset.assetTag}</span></span>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    asset.status
                  )}`}
                >
                  {asset.status === "ACTIVE" ? t("assets.statusActive") :
                   asset.status === "IN_REPAIR" ? t("assets.statusInRepair") :
                   asset.status === "DISPOSED" ? t("assets.statusDisposed") :
                   asset.status === "STOLEN" ? t("assets.statusStolen") :
                   asset.status === "LOST" ? t("assets.statusLost") :
                   asset.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.basicInformation")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("assets.category")}</p>
                  <p className="text-base font-medium text-gray-900">{asset.category}</p>
                </div>
                {asset.manufacturer && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.manufacturer")}</p>
                    <p className="text-base font-medium text-gray-900">{asset.manufacturer}</p>
                  </div>
                )}
                {asset.model && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.model")}</p>
                    <p className="text-base font-medium text-gray-900">{asset.model}</p>
                  </div>
                )}
                {asset.serialNumber && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.serialNumber")}</p>
                    <p className="text-base font-medium text-gray-900">{asset.serialNumber}</p>
                  </div>
                )}
                {asset.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">{t("assets.description")}</p>
                    <p className="text-base text-gray-900">{asset.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                {t("assets.financialInformation")}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("assets.acquisitionCost")}</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(asset.acquisitionCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("assets.currentValue")}</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(asset.currentValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("assets.residualValue")}</p>
                  <p className="text-base font-medium text-gray-900">{formatCurrency(asset.residualValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("assets.acquisitionDate")}</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(asset.acquisitionDate)}</p>
                </div>
                {asset.serviceDate && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.serviceDate")}</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(asset.serviceDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Depreciation Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.depreciation")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("assets.depreciationMethod")}</p>
                  <p className="text-base font-medium text-gray-900">
                    {asset.depreciationMethod.replace(/_/g, " ")}
                  </p>
                </div>
                {asset.usefulLifeYears && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.usefulLife")}</p>
                    <p className="text-base font-medium text-gray-900">{asset.usefulLifeYears} {t("assets.years")}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">{t("assets.convention")}</p>
                  <p className="text-base font-medium text-gray-900">
                    {asset.convention.replace(/_/g, " ")}
                  </p>
                </div>
                {asset.depreciationPercentage && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.depreciationRate")}</p>
                    <p className="text-base font-medium text-gray-900">{asset.depreciationPercentage}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Assignment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.locationAssignment")}</h2>
              <div className="grid grid-cols-2 gap-4">
                {asset.location && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {t("assets.physicalLocation")}
                    </p>
                    <p className="text-base font-medium text-gray-900">{asset.location.name}</p>
                    <p className="text-sm text-gray-500">{asset.location.type}</p>
                  </div>
                )}
                {currentAssignment && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {t("assets.assignedTo")}
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {currentAssignment.user.firstName} {currentAssignment.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{currentAssignment.user.email}</p>
                  </div>
                )}
                {asset.branch && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.branch")}</p>
                    <p className="text-base font-medium text-gray-900">
                      {asset.branch.code} - {asset.branch.name}
                    </p>
                  </div>
                )}
                {asset.department && (
                  <div>
                    <p className="text-sm text-gray-500">{t("assets.department")}</p>
                    <p className="text-base font-medium text-gray-900">
                      {asset.department.branch.code}-{asset.department.code} - {asset.department.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Information */}
            {(asset.supplier || asset.purchaseDocument || asset.invoiceNumber) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.supplierPurchase")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {asset.supplier && (
                    <div>
                      <p className="text-sm text-gray-500">{t("assets.supplier")}</p>
                      <p className="text-base font-medium text-gray-900">{asset.supplier}</p>
                    </div>
                  )}
                  {asset.invoiceNumber && (
                    <div>
                      <p className="text-sm text-gray-500">{t("assets.invoiceNumber")}</p>
                      <p className="text-base font-medium text-gray-900">{asset.invoiceNumber}</p>
                    </div>
                  )}
                  {asset.purchaseDocument && (
                    <div>
                      <p className="text-sm text-gray-500">{t("assets.purchaseDocument")}</p>
                      <p className="text-base font-medium text-gray-900">{asset.purchaseDocument}</p>
                    </div>
                  )}
                  {asset.supplierSerialNumber && (
                    <div>
                      <p className="text-sm text-gray-500">{t("assets.supplierSerialNumber")}</p>
                      <p className="text-base font-medium text-gray-900">{asset.supplierSerialNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observations */}
            {asset.observations && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.observations")}</h2>
                <p className="text-base text-gray-900 whitespace-pre-wrap">{asset.observations}</p>
              </div>
            )}
          </div>

          {/* Right Column - Photo & Barcode */}
          <div className="space-y-6">
            {/* Asset Photo */}
            {asset.photoUrl && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.photo")}</h2>
                <img
                  src={asset.photoUrl}
                  alt={asset.name}
                  className="w-full rounded-lg object-cover"
                />
              </div>
            )}

            {/* Barcode Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.assetBarcode")}</h2>
              {asset.qrCodeUrl ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <img
                      src={asset.qrCodeUrl}
                      alt="Asset QR Code"
                      className="w-full max-w-[250px] mx-auto"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handlePrintBarcode}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      {t("assets.printBarcode")}
                    </button>
                    <button
                      onClick={handleRegenerateBarcode}
                      disabled={generateBarcodeMutation.isPending}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {generateBarcodeMutation.isPending ? t("assets.regenerating") : t("assets.regenerateBarcode")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{t("assets.noBarcode")}</p>
                  <button
                    onClick={handleRegenerateBarcode}
                    disabled={generateBarcodeMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {generateBarcodeMutation.isPending ? t("assets.generating") : t("assets.generateBarcode")}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.quickStats")}</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t("assets.depreciation")}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {((1 - asset.currentValue / asset.acquisitionCost) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t("assets.age")}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.floor(
                      (new Date().getTime() - new Date(asset.acquisitionDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365)
                    )}{" "}
                    {t("assets.years")}
                  </span>
                </div>
                {asset.usefulLifeYears && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t("assets.remainingLife")}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.max(
                        0,
                        asset.usefulLifeYears -
                          Math.floor(
                            (new Date().getTime() - new Date(asset.acquisitionDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 365)
                          )
                      )}{" "}
                      {t("assets.years")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
