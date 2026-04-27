import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useState } from "react";
import { QrCode, Printer, Check, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/inventory/bulk-print/")({
  component: BulkPrintPage,
});

function BulkPrintPage() {
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const assetsQuery = useQuery(
    trpc.listAssets.queryOptions({
      authToken: authToken || "",
      search: search || undefined,
      status: statusFilter || undefined,
      limit: 100,
    })
  );

  const companyQuery = useQuery(
    trpc.getCompanySettings.queryOptions({
      authToken: authToken || "",
    })
  );

  const handleToggleAsset = (assetId: number) => {
    setSelectedAssets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!assetsQuery.data) return;
    
    if (selectedAssets.size === assetsQuery.data.assets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assetsQuery.data.assets.map((a) => a.id)));
    }
  };

  const handlePrintSelected = () => {
    if (!assetsQuery.data || selectedAssets.size === 0) {
      toast.error(t("inventory.selectAtLeastOne"));
      return;
    }

    const selectedAssetData = assetsQuery.data.assets.filter((asset) =>
      selectedAssets.has(asset.id)
    );

    if (selectedAssetData.length === 0) {
      toast.error(t("inventory.noAssetsSelected"));
      return;
    }

    // Get label configuration from company settings or use defaults
    const labelConfig = companyQuery.data?.barcodeLabelConfig || {
      labelWidth: 80,
      labelHeight: 50,
      unit: "mm",
      columns: 3,
      horizontalSpacing: 10,
      verticalSpacing: 10,
      logoPosition: "top-center",
      showCompanyLogo: true,
      showAssetTag: true,
      showAssetName: true,
      showCategory: false,
      showLocation: false,
      showBranch: false,
      showDepartment: false,
      showAssetType: false,
      qrCodeSize: 150,
      assetTagFontSize: 18,
      assetNameFontSize: 14,
      detailsFontSize: 12,
      showBorder: true,
    };

    const companyLogoUrl = companyQuery.data?.logoUrl;

    // Generate HTML for all barcodes based on configuration
    const barcodesHTML = selectedAssetData
      .map((asset) => {
        const details: string[] = [];
        
        if (labelConfig.showCategory) {
          details.push(`<div class="asset-detail">${asset.category}</div>`);
        }
        if (labelConfig.showLocation && asset.location) {
          details.push(`<div class="asset-detail">Location: ${asset.location.name}</div>`);
        }
        if (labelConfig.showBranch && asset.branch) {
          details.push(`<div class="asset-detail">Branch: ${asset.branch.name}</div>`);
        }
        if (labelConfig.showDepartment && asset.department) {
          details.push(`<div class="asset-detail">Department: ${asset.department.name}</div>`);
        }
        if (labelConfig.showAssetType && asset.assetType) {
          details.push(`<div class="asset-detail">Type: ${asset.assetType.name}</div>`);
        }

        return `
        <div class="barcode-container">
          ${
            labelConfig.showCompanyLogo && companyLogoUrl
              ? `<div class="logo-container logo-${labelConfig.logoPosition}"><img src="${companyLogoUrl}" alt="Company Logo" class="company-logo" /></div>`
              : ''
          }
          ${
            asset.photoUrl
              ? `<img src="${asset.photoUrl}" alt="Asset QR Code" class="barcode-image" />`
              : '<div class="no-qr">No QR Code</div>'
          }
          ${labelConfig.showAssetTag ? `<div class="asset-tag">${asset.assetTag}</div>` : ''}
          ${labelConfig.showAssetName ? `<div class="asset-name">${asset.name}</div>` : ''}
          ${details.length > 0 ? details.join('') : ''}
        </div>
      `;
      })
      .join("");

    // Convert mm to pixels for CSS (1mm ≈ 3.78px at 96dpi)
    const labelWidthPx = labelConfig.unit === "mm" ? labelConfig.labelWidth * 3.78 : labelConfig.labelWidth * 96;
    const labelHeightPx = labelConfig.unit === "mm" ? labelConfig.labelHeight * 3.78 : labelConfig.labelHeight * 96;
    const horizontalSpacingPx = labelConfig.horizontalSpacing * 3.78;
    const verticalSpacingPx = labelConfig.verticalSpacing * 3.78;

    // Open a new window with all barcodes for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Barcodes - ${selectedAssetData.length} Assets</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .barcode-grid {
                display: grid;
                grid-template-columns: repeat(${labelConfig.columns}, 1fr);
                gap: ${verticalSpacingPx}px ${horizontalSpacingPx}px;
                padding: 20px;
              }
              .barcode-container {
                width: ${labelWidthPx}px;
                height: ${labelHeightPx}px;
                text-align: center;
                page-break-inside: avoid;
                ${labelConfig.showBorder ? 'border: 2px solid #000;' : ''}
                padding: 10px;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
              }
              .logo-container {
                width: 100%;
                margin-bottom: 8px;
                display: flex;
              }
              .logo-container.logo-top-left {
                justify-content: flex-start;
              }
              .logo-container.logo-top-center {
                justify-content: center;
              }
              .logo-container.logo-top-right {
                justify-content: flex-end;
              }
              .company-logo {
                max-width: 120px;
                max-height: 32px;
                display: block;
                object-fit: contain;
              }
              .barcode-image {
                max-width: ${labelConfig.qrCodeSize}px;
                max-height: ${labelConfig.qrCodeSize}px;
                margin: 0 auto 8px;
                display: block;
              }
              .no-qr {
                width: ${labelConfig.qrCodeSize}px;
                height: ${labelConfig.qrCodeSize}px;
                margin: 0 auto 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f3f4f6;
                color: #6b7280;
                border: 2px dashed #d1d5db;
                border-radius: 4px;
                font-size: 10px;
              }
              .asset-tag {
                font-size: ${labelConfig.assetTagFontSize}px;
                font-weight: bold;
                margin-top: 4px;
                color: #111827;
                word-wrap: break-word;
                max-width: 100%;
              }
              .asset-name {
                font-size: ${labelConfig.assetNameFontSize}px;
                color: #374151;
                margin-top: 4px;
                word-wrap: break-word;
                max-width: 100%;
              }
              .asset-detail {
                font-size: ${labelConfig.detailsFontSize}px;
                color: #6b7280;
                margin-top: 2px;
                word-wrap: break-word;
                max-width: 100%;
              }
              @media print {
                body {
                  padding: 0;
                }
                .barcode-grid {
                  gap: ${verticalSpacingPx}px ${horizontalSpacingPx}px;
                  padding: 10px;
                }
                .barcode-container {
                  ${labelConfig.showBorder ? 'border: 1px solid #000;' : ''}
                }
              }
              @page {
                margin: 1cm;
              }
            </style>
          </head>
          <body>
            <div class="barcode-grid">
              ${barcodesHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const allSelected =
    assetsQuery.data &&
    assetsQuery.data.assets.length > 0 &&
    selectedAssets.size === assetsQuery.data.assets.length;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("inventory.bulkPrintTitle")}
              </h1>
              <p className="text-gray-600">
                {t("inventory.bulkPrintSubtitle")}
              </p>
            </div>
            <button
              onClick={handlePrintSelected}
              disabled={selectedAssets.size === 0}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5 mr-2" />
              {t("inventory.printSelected")} {selectedAssets.size > 0 ? `(${selectedAssets.size})` : ""}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("common.search")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("reports.searchPlaceholder")}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("assets.status")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("assets.allStatuses")}</option>
                  <option value="ACTIVE">{t("assets.statusActive")}</option>
                  <option value="IN_REPAIR">{t("assets.statusInRepair")}</option>
                  <option value="DISPOSED">{t("assets.statusDisposed")}</option>
                  <option value="STOLEN">{t("assets.statusStolen")}</option>
                  <option value="LOST">{t("assets.statusLost")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Assets List */}
        {assetsQuery.isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : assetsQuery.isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{t("assets.failedToLoad")}</p>
          </div>
        ) : assetsQuery.data.assets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("assets.noAssetsFound")}
              </h3>
              <p className="text-gray-600">
                {t("reports.adjustFilters")}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("assets.asset")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("assets.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("assets.location")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assetsQuery.data.assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedAssets.has(asset.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAssets.has(asset.id)}
                          onChange={() => handleToggleAsset(asset.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {asset.photoUrl ? (
                            <img
                              src={asset.photoUrl}
                              alt={asset.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <QrCode className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {asset.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {asset.assetTag}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {asset.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {asset.location ? (
                          <div className="text-sm text-gray-900">
                            {asset.location.name}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {asset.photoUrl ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-400">No Photo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
