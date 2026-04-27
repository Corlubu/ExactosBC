import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/assets/new")({
  component: NewAssetPage,
});

const assetSchema = z.object({
  // Basic Information
  assetTag: z.string().min(1, "Asset tag is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["ACTIVE", "IN_REPAIR", "DISPOSED", "STOLEN", "LOST"]),
  
  // Asset Identification & Internal Codes
  classCode: z.string().optional(),
  costCenterCode: z.string().optional(),
  areaCode: z.string().optional(),
  subareaCode: z.string().optional(),
  branchCode: z.string().optional(),
  serialNumber: z.string().optional(),
  supplierSerialNumber: z.string().optional(),
  
  // New organizational structure
  branchId: z.number().optional(),
  departmentId: z.number().optional(),
  assetTypeId: z.number().optional(),
  
  // Additional identification
  seriesNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  
  // Components
  component1: z.string().optional(),
  component2: z.string().optional(),
  component3: z.string().optional(),
  
  // Supplier & Purchase Information
  supplier: z.string().optional(),
  purchaseDocument: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  quantity: z.number().int().min(1).optional(),
  currency: z.string().optional(),
  
  // Financial Information
  acquisitionCost: z.number().min(0, "Must be non-negative"),
  currentValue: z.number().min(0, "Must be non-negative"),
  residualValue: z.number().min(0).default(0),
  acquisitionDate: z.date(),
  serviceDate: z.date().optional(),
  
  // Depreciation Settings
  depreciationMethod: z.enum([
    "STRAIGHT_LINE",
    "DECLINING_BALANCE",
    "UNITS_OF_PRODUCTION",
    "SUM_OF_YEARS_DIGITS",
  ]),
  usefulLifeYears: z.number().int().min(1).optional(),
  convention: z.enum(["HALF_YEAR", "FULL_YEAR", "MID_MONTH"]),
  depreciationPercentage: z.number().min(0).max(100).optional(),
  depreciationStartDate: z.date().optional(),
  
  // Accounting Information
  accountingAssetAccount: z.string().optional(),
  accumulatedDepreciationAccount: z.string().optional(),
  depreciationExpenseAccount: z.string().optional(),
  fixedAssetLedger: z.string().optional(),
  
  // Physical Details & Location
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  locationId: z.number().optional(),
  
  // Assignment
  assignedToUserId: z.number().optional(),
  
  // Custody Certificate Details (for initial assignment)
  assignmentBriefDescription: z.string().optional(),
  assignmentFixedAssetCode: z.string().optional(),
  assignmentInitialCondition: z.string().optional(),
  assignmentMaintenanceObligations: z.string().optional(),
  
  // Activity & Project
  activityProject: z.string().optional(),
  
  // Observations
  observations: z.string().optional(),
});

type AssetForm = z.infer<typeof assetSchema>;

function NewAssetPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const locationsQuery = useQuery(
    trpc.listLocations.queryOptions({
      authToken: authToken || "",
    })
  );

  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      authToken: authToken || "",
      activeOnly: true,
    })
  );

  const branchesQuery = useQuery(
    trpc.listBranches.queryOptions({
      authToken: authToken || "",
    })
  );

  const departmentsQuery = useQuery(
    trpc.listDepartments.queryOptions({
      authToken: authToken || "",
    })
  );

  const assetTypesQuery = useQuery(
    trpc.listAssetTypes.queryOptions({
      authToken: authToken || "",
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      depreciationMethod: "STRAIGHT_LINE",
      convention: "HALF_YEAR",
      status: "ACTIVE",
      residualValue: 0,
      acquisitionDate: new Date(),
      quantity: 1,
      currency: "USD",
    },
  });

  const assignedToUserId = watch("assignedToUserId");

  const getPresignedUrlMutation = useMutation(
    trpc.getPresignedUrl.mutationOptions()
  );

  const createAssetMutation = useMutation(
    trpc.createAsset.mutationOptions({
      onSuccess: (data) => {
        toast.success(t("assets.assetCreated"));
        void navigate({
          to: "/app/assets/$assetId",
          params: { assetId: data.id.toString() },
        });
      },
      onError: (error) => {
        toast.error(error.message || t("assets.failedToCreate"));
      },
    })
  );

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.company.selectImageFile"));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setPhotoUrl(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !authToken) return;

    setIsUploading(true);
    try {
      // Get presigned URL
      const { uploadUrl, publicUrl } = await getPresignedUrlMutation.mutateAsync({
        authToken,
        fileName: selectedFile.name,
        fileType: "PHOTO",
      });

      // Upload file to MinIO
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      setPhotoUrl(publicUrl);
      toast.success(t("settings.company.uploadSuccess"));
    } catch (error) {
      toast.error(t("settings.company.uploadError"));
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPhotoUrl(null);
  };

  const onSubmit = (data: AssetForm) => {
    createAssetMutation.mutate({
      authToken: authToken || "",
      ...data,
      photoUrl: photoUrl || undefined,
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/assets" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("assets.backToAssets")}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("assets.addNewAsset")}</h1>
          <p className="text-gray-600">{t("assets.addNewAssetSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("assets.assetPhoto")}</h2>
            <div className="space-y-4">
              {!photoUrl ? (
                <>
                  <div className="flex items-center space-x-4">
                    <label className="flex-1">
                      <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {selectedFile ? selectedFile.name : t("assets.clickToSelect")}
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                  {selectedFile && !photoUrl && (
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isUploading ? t("assets.uploading") : t("assets.uploadPhoto")}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-start space-x-4">
                  <img
                    src={photoUrl}
                    alt="Asset preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-green-600 mb-2">{t("assets.photoUploaded")}</p>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      {t("assets.removePhoto")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.basicInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.assetTag")} * <span className="text-xs text-gray-500">{t("assets.uniqueIdentifier")}</span>
                </label>
                <input
                  type="text"
                  {...register("assetTag")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.assetTagPlaceholder")}
                />
                {errors.assetTag && (
                  <p className="mt-1 text-sm text-red-600">{errors.assetTag.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.assetName")} * <span className="text-xs text-gray-500">{t("assets.exampleName")}</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.assetNamePlaceholder")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.description")}
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.descriptionPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.category")} *
                </label>
                <input
                  type="text"
                  {...register("category")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.categoryPlaceholder")}
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.status")} *
                </label>
                <select
                  {...register("status")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">{t("assets.statusActive")}</option>
                  <option value="IN_REPAIR">{t("assets.statusInRepair")}</option>
                  <option value="DISPOSED">{t("assets.statusDisposed")}</option>
                  <option value="STOLEN">{t("assets.statusStolen")}</option>
                  <option value="LOST">{t("assets.statusLost")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Organizational Structure */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.organizationalStructure")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.branch")}
                </label>
                <select
                  {...register("branchId", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("assets.selectBranch")}</option>
                  {branchesQuery.data?.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.code} - {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.department")}
                </label>
                <select
                  {...register("departmentId", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("assets.selectDepartment")}</option>
                  {departmentsQuery.data?.departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.branch.code}-{department.code} - {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.assetType")}
                </label>
                <select
                  {...register("assetTypeId", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("assets.selectAssetType")}</option>
                  {assetTypesQuery.data?.assetTypes.map((assetType) => (
                    <option key={assetType.id} value={assetType.id}>
                      {assetType.code} - {assetType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.classCode")} <span className="text-xs text-gray-500">{t("assets.legacyField")}</span>
                </label>
                <input
                  type="text"
                  {...register("classCode")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.classCodePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.costCenterCode")}
                </label>
                <input
                  type="text"
                  {...register("costCenterCode")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.costCenterCodePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.areaCode")}
                </label>
                <input
                  type="text"
                  {...register("areaCode")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.areaCodePlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Asset Identification */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.assetIdentification")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.serialNumberInternal")} <span className="text-xs text-gray-500">{t("assets.internalLabel")}</span>
                </label>
                <input
                  type="text"
                  {...register("serialNumber")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.serialNumberPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.seriesNumber")}
                </label>
                <input
                  type="text"
                  {...register("seriesNumber")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.seriesNumberPlaceholder")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.supplierSerialNumber")} <span className="text-xs text-gray-500">{t("assets.manufacturerSN")}</span>
                </label>
                <input
                  type="text"
                  {...register("supplierSerialNumber")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.supplierSerialNumberPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Supplier & Purchase Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.supplierPurchaseInfo")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.supplier")}
                </label>
                <input
                  type="text"
                  {...register("supplier")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.supplierPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.invoiceNumber")}
                </label>
                <input
                  type="text"
                  {...register("invoiceNumber")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.invoiceNumberPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.purchaseDocument")} <span className="text-xs text-gray-500">{t("assets.contractPO")}</span>
                </label>
                <input
                  type="text"
                  {...register("purchaseDocument")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.purchaseDocumentPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.unitCost")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("unitCost", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.quantity")} <span className="text-xs text-gray-500">{t("assets.forIdenticalItems")}</span>
                </label>
                <input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.quantityPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.currency")}
                </label>
                <input
                  type="text"
                  {...register("currency")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.currencyPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.financialInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.acquisitionCost")} * <span className="text-xs text-gray-500">{t("assets.originalValue")}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("acquisitionCost", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.acquisitionCostPlaceholder")}
                />
                {errors.acquisitionCost && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.acquisitionCost.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.currentValue")} * <span className="text-xs text-gray-500">{t("assets.depreciableValue")}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("currentValue", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.currentValuePlaceholder")}
                />
                {errors.currentValue && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.currentValue.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.residualValue")} <span className="text-xs text-gray-500">{t("assets.salvageValue")}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("residualValue", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.residualValuePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.acquisitionDate")} *
                </label>
                <input
                  type="date"
                  {...register("acquisitionDate", { valueAsDate: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.serviceDate")} <span className="text-xs text-gray-500">{t("assets.datePutIntoService")}</span>
                </label>
                <input
                  type="date"
                  {...register("serviceDate", { valueAsDate: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Depreciation Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.depreciationSettings")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.depreciationMethod")} *
                </label>
                <select
                  {...register("depreciationMethod")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="STRAIGHT_LINE">{t("assets.straightLine")}</option>
                  <option value="DECLINING_BALANCE">{t("assets.decliningBalance")}</option>
                  <option value="UNITS_OF_PRODUCTION">{t("assets.unitsOfProduction")}</option>
                  <option value="SUM_OF_YEARS_DIGITS">{t("assets.sumOfYearsDigits")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.convention")} *
                </label>
                <select
                  {...register("convention")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="HALF_YEAR">{t("assets.halfYear")}</option>
                  <option value="FULL_YEAR">{t("assets.fullYear")}</option>
                  <option value="MID_MONTH">{t("assets.midMonth")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.usefulLifeYears")} <span className="text-xs text-gray-500">{t("assets.accountingLabel")}</span>
                </label>
                <input
                  type="number"
                  {...register("usefulLifeYears", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.usefulLifePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.depreciationPercentage")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("depreciationPercentage", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.depreciationPercentagePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.depreciationStartDate")}
                </label>
                <input
                  type="date"
                  {...register("depreciationStartDate", { valueAsDate: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Accounting Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.accountingInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.assetAccountNumber")}
                </label>
                <input
                  type="text"
                  {...register("accountingAssetAccount")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.assetAccountPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.accumulatedDepreciationAccount")}
                </label>
                <input
                  type="text"
                  {...register("accumulatedDepreciationAccount")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.accumulatedDepreciationPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.depreciationExpenseAccount")}
                </label>
                <input
                  type="text"
                  {...register("depreciationExpenseAccount")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.depreciationExpensePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.fixedAssetLedger")}
                </label>
                <input
                  type="text"
                  {...register("fixedAssetLedger")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.fixedAssetLedgerPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Physical Details & Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.physicalDetailsLocation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.manufacturer")}
                </label>
                <input
                  type="text"
                  {...register("manufacturer")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.manufacturerPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.model")}
                </label>
                <input
                  type="text"
                  {...register("model")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.modelPlaceholder")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.physicalLocation")}
                </label>
                <select
                  {...register("locationId", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("assets.selectLocation")}</option>
                  {locationsQuery.data?.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Components */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.assetComponents")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.component1")}
                </label>
                <input
                  type="text"
                  {...register("component1")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.component1Placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.component2")}
                </label>
                <input
                  type="text"
                  {...register("component2")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.component2Placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.component3")}
                </label>
                <input
                  type="text"
                  {...register("component3")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("assets.component3Placeholder")}
                />
              </div>
            </div>
          </div>

          {/* Assignment & Responsibility */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.assignmentResponsibility")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assets.personResponsible")}
                </label>
                <select
                  {...register("assignedToUserId", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("assets.unassigned")}</option>
                  {usersQuery.data?.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {assignedToUserId && (
                <>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">
                      {t("assets.custodyCertificateDetails")}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {t("assets.custodyCertificateMessage")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("assets.fixedAssetCode")}
                    </label>
                    <input
                      type="text"
                      {...register("assignmentFixedAssetCode")}
                      placeholder={t("assets.fixedAssetCodePlaceholder")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("assets.briefDescription")}
                    </label>
                    <textarea
                      {...register("assignmentBriefDescription")}
                      rows={2}
                      placeholder={t("assets.briefDescriptionPlaceholder")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("assets.initialCondition")}
                    </label>
                    <textarea
                      {...register("assignmentInitialCondition")}
                      rows={2}
                      placeholder={t("assets.initialConditionPlaceholder")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("assets.maintenanceObligations")}
                    </label>
                    <textarea
                      {...register("assignmentMaintenanceObligations")}
                      rows={3}
                      placeholder={t("assets.maintenanceObligationsPlaceholder")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Activity & Project */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.activityProject")}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("assets.activityProjectLink")}
              </label>
              <input
                type="text"
                {...register("activityProject")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("assets.activityProjectPlaceholder")}
              />
            </div>
          </div>

          {/* Observations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assets.additionalObservations")}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("assets.observations")} <span className="text-xs text-gray-500">{t("assets.specialConditions")}</span>
              </label>
              <textarea
                {...register("observations")}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("assets.observationsPlaceholder")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pb-8">
            <button
              type="button"
              onClick={() => navigate({ to: "/app/assets" })}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={createAssetMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {createAssetMutation.isPending ? t("assets.creating") : t("assets.createAsset")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
