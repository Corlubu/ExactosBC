import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/app/inventory/initial-inventory/")({
  component: InitialInventoryPage,
});

interface ParsedAsset {
  assetTag: string;
  name: string;
  description?: string;
  category: string;
  status?: string;
  acquisitionCost: number;
  currentValue: number;
  residualValue?: number;
  acquisitionDate: string;
  serviceDate?: string;
  depreciationMethod?: string;
  usefulLifeYears?: number;
  convention?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  supplier?: string;
  purchaseDocument?: string;
  supplierSerialNumber?: string;
  unitCost?: number;
  quantity?: number;
  currency?: string;
  depreciationPercentage?: number;
  depreciationStartDate?: string;
  accountingAssetAccount?: string;
  accumulatedDepreciationAccount?: string;
  depreciationExpenseAccount?: string;
  fixedAssetLedger?: string;
  classCode?: string;
  costCenterCode?: string;
  areaCode?: string;
  subareaCode?: string;
  branchCode?: string;
  branchId?: number;
  departmentId?: number;
  assetTypeId?: number;
  seriesNumber?: string;
  invoiceNumber?: string;
  component1?: string;
  component2?: string;
  component3?: string;
  activityProject?: string;
  observations?: string;
  locationId?: number;
  assignedToUserId?: number;
}

function InitialInventoryPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedAssets, setParsedAssets] = useState<ParsedAsset[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [importResults, setImportResults] = useState<{
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    errors: Array<{ row: number; assetTag: string; error: string }>;
  } | null>(null);

  const bulkImportMutation = useMutation(
    trpc.bulkImportAssets.mutationOptions({
      onSuccess: (data) => {
        setImportResults(data);
        if (data.failureCount === 0) {
          toast.success(`${t("inventory.successful")}: ${data.successCount} ${t("inventory.assetsCount")}`);
        } else {
          toast.error(
            `${data.successCount} ${t("inventory.successful")}, ${data.failureCount} ${t("inventory.failed")}`
          );
        }
      },
      onError: (error) => {
        toast.error(error.message || t("inventory.failedToCreate"));
      },
    })
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
      toast.error(t("inventory.selectCsvOrExcel"));
      return;
    }

    setSelectedFile(file);
    setParsedAssets([]);
    setImportResults(null);
  };

  const parseCSVFile = async (file: File): Promise<ParsedAsset[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());
          
          if (lines.length < 2) {
            reject(new Error("File is empty or has no data rows"));
            return;
          }

          const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
          const assets: ParsedAsset[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
            const asset: Record<string, string | number> = {};

            headers.forEach((header, index) => {
              const value = values[index];
              if (value) {
                // Convert numeric fields
                if (
                  [
                    "acquisitionCost",
                    "currentValue",
                    "residualValue",
                    "unitCost",
                    "quantity",
                    "usefulLifeYears",
                    "depreciationPercentage",
                    "branchId",
                    "departmentId",
                    "assetTypeId",
                    "locationId",
                    "assignedToUserId",
                  ].includes(header)
                ) {
                  asset[header] = parseFloat(value);
                } else {
                  asset[header] = value;
                }
              }
            });

            if (asset.assetTag && asset.name) {
              assets.push(asset as ParsedAsset);
            }
          }

          resolve(assets);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const parseExcelFile = async (file: File): Promise<ParsedAsset[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error("Failed to read file data"));
            return;
          }

          // Parse the Excel file
          const workbook = XLSX.read(data, { type: "binary" });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            reject(new Error("Excel file has no sheets"));
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert sheet to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false, // Convert dates and numbers to strings for consistent parsing
            defval: "" // Default value for empty cells
          });

          if (jsonData.length === 0) {
            reject(new Error("Excel file has no data rows"));
            return;
          }

          const assets: ParsedAsset[] = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i] as Record<string, string>;
            const asset: Record<string, string | number> = {};

            // Process each field in the row
            Object.keys(row).forEach((key) => {
              const value = row[key]?.toString().trim();
              if (value) {
                // Convert numeric fields
                if (
                  [
                    "acquisitionCost",
                    "currentValue",
                    "residualValue",
                    "unitCost",
                    "quantity",
                    "usefulLifeYears",
                    "depreciationPercentage",
                    "branchId",
                    "departmentId",
                    "assetTypeId",
                    "locationId",
                    "assignedToUserId",
                  ].includes(key)
                ) {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    asset[key] = numValue;
                  }
                } else {
                  asset[key] = value;
                }
              }
            });

            // Only add if required fields are present
            if (asset.assetTag && asset.name) {
              assets.push(asset as ParsedAsset);
            }
          }

          if (assets.length === 0) {
            reject(new Error("No valid assets found in Excel file. Ensure assetTag and name columns are present."));
            return;
          }

          resolve(assets);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const handleParseFile = async () => {
    if (!selectedFile) return;

    setIsParsingFile(true);
    try {
      let assets: ParsedAsset[];
      
      // Determine file type and use appropriate parser
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith(".csv")) {
        assets = await parseCSVFile(selectedFile);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        assets = await parseExcelFile(selectedFile);
      } else {
        throw new Error("Unsupported file type. Please upload a CSV or Excel file.");
      }
      
      setParsedAssets(assets);
      toast.success(`${t("inventory.parsedAssets").replace("{count}", assets.length.toString())}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("inventory.failedToParse")
      );
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleImport = () => {
    if (!authToken || parsedAssets.length === 0) return;

    bulkImportMutation.mutate({
      authToken,
      assets: parsedAssets,
    });
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "assetTag",
      "name",
      "description",
      "category",
      "status",
      "acquisitionCost",
      "currentValue",
      "residualValue",
      "acquisitionDate",
      "serviceDate",
      "depreciationMethod",
      "usefulLifeYears",
      "convention",
      "serialNumber",
      "manufacturer",
      "model",
      "supplier",
      "purchaseDocument",
      "supplierSerialNumber",
      "unitCost",
      "quantity",
      "currency",
      "locationId",
    ];

    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "asset_import_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedAssets([]);
    setImportResults(null);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/inventory" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("inventory.backToInventory")}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("inventory.initialInventoryTitle")}
          </h1>
          <p className="text-gray-600">
            {t("inventory.bulkImportSubtitle")}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">{t("inventory.importInstructions")}</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>{t("inventory.instruction1")}</li>
                <li>{t("inventory.instruction2")}</li>
                <li>{t("inventory.instruction3")}</li>
                <li>{t("inventory.instruction4")}</li>
                <li>{t("inventory.instruction5")}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("inventory.csvTemplate")}</h3>
                <p className="text-sm text-gray-600">
                  {t("inventory.downloadTemplate")}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t("inventory.downloadTemplateButton")}</span>
            </button>
          </div>
        </div>

        {/* File Upload */}
        {!importResults && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("inventory.uploadFile")}</h2>
            <div className="space-y-4">
              <div>
                <label className="flex-1">
                  <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedFile
                          ? selectedFile.name
                          : t("inventory.clickToSelectFile")}
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {selectedFile && parsedAssets.length === 0 && (
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleParseFile}
                    disabled={isParsingFile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isParsingFile ? t("inventory.parsing") : t("inventory.parseFile")}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Preview */}
        {parsedAssets.length > 0 && !importResults && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("inventory.dataPreview")} ({parsedAssets.length} {t("inventory.assetsCount")})
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={bulkImportMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {bulkImportMutation.isPending ? t("inventory.importing") : t("inventory.importAssets")}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.assetTag")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.category")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.acquisitionCost")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.currentValue")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("inventory.acquisitionDate")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedAssets.slice(0, 10).map((asset, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {asset.assetTag}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {asset.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {asset.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${asset.acquisitionCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${asset.currentValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {asset.acquisitionDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedAssets.length > 10 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  {t("common.showing")} 10 {t("common.of")} {parsedAssets.length} {t("inventory.assetsCount")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("inventory.importResults")}
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">{t("inventory.totalProcessed")}</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {importResults.totalProcessed}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">{t("inventory.successful")}</p>
                    <p className="text-2xl font-bold text-green-900">
                      {importResults.successCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-red-600">{t("inventory.failed")}</p>
                    <p className="text-2xl font-bold text-red-900">
                      {importResults.failureCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">{t("inventory.errors")}</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <ul className="space-y-2">
                    {importResults.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-800">
                        <span className="font-medium">{t("inventory.row")} {error.row}</span> (
                        {error.assetTag}): {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate({ to: "/app/assets" })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t("inventory.viewAssets")}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t("inventory.importMoreAssets")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
