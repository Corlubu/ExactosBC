import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { Tag, ArrowLeft, Save, Eye } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/labels/")({
  component: LabelSettingsPage,
});

const labelConfigSchema = z.object({
  // Label Dimensions
  labelWidth: z.number().min(20).max(200),
  labelHeight: z.number().min(20).max(200),
  unit: z.enum(["mm", "inches"]),
  
  // Layout
  columns: z.number().min(1).max(6),
  horizontalSpacing: z.number().min(0).max(50),
  verticalSpacing: z.number().min(0).max(50),
  
  // Logo Position
  logoPosition: z.enum(["top-left", "top-center", "top-right"]),
  
  // Display Fields
  showCompanyLogo: z.boolean(),
  showAssetTag: z.boolean(),
  showAssetName: z.boolean(),
  showCategory: z.boolean(),
  showLocation: z.boolean(),
  showBranch: z.boolean(),
  showDepartment: z.boolean(),
  showAssetType: z.boolean(),
  
  // Styling
  qrCodeSize: z.number().min(50).max(300),
  assetTagFontSize: z.number().min(8).max(32),
  assetNameFontSize: z.number().min(8).max(24),
  detailsFontSize: z.number().min(6).max(18),
  
  // Border
  showBorder: z.boolean(),
});

type LabelConfigForm = z.infer<typeof labelConfigSchema>;

const defaultConfig: LabelConfigForm = {
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

function LabelSettingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch current company settings
  const companyQuery = useQuery(
    trpc.getCompanySettings.queryOptions({
      authToken: authToken || "",
    })
  );

  // Update mutation
  const updateMutation = useMutation(
    trpc.updateCompanySettings.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.labels.settingsUpdated"));
        void companyQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.labels.failedToUpdate"));
      },
    })
  );

  const currentConfig = companyQuery.data?.barcodeLabelConfig || defaultConfig;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<LabelConfigForm>({
    resolver: zodResolver(labelConfigSchema),
    values: currentConfig,
  });

  const onSubmit = (data: LabelConfigForm) => {
    if (!companyQuery.data) return;

    updateMutation.mutate({
      authToken: authToken || "",
      name: companyQuery.data.name,
      barcodeLabelConfig: data,
    });
  };

  const handleCancel = () => {
    reset();
  };

  // Watch all form values for live preview
  const formValues = watch();

  if (companyQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (companyQuery.isError) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{t("settings.labels.failedToLoad")}</p>
            <button
              onClick={() => companyQuery.refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t("settings.labels.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/settings" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("settings.backToSettings")}
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("settings.labels.title")}</h1>
                <p className="text-gray-600 mt-1">
                  {t("settings.labels.subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? t("settings.labels.hidePreview") : t("settings.labels.showPreview")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Label Dimensions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("settings.labels.labelDimensions")}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("settings.labels.width")}
                      </label>
                      <input
                        type="number"
                        {...register("labelWidth", { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.labelWidth && (
                        <p className="mt-1 text-sm text-red-600">{errors.labelWidth.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("settings.labels.height")}
                      </label>
                      <input
                        type="number"
                        {...register("labelHeight", { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.labelHeight && (
                        <p className="mt-1 text-sm text-red-600">{errors.labelHeight.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.labels.unit")}
                    </label>
                    <select
                      {...register("unit")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mm">{t("settings.labels.millimeters")}</option>
                      <option value="inches">{t("settings.labels.inches")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Layout Configuration */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("settings.labels.layoutConfiguration")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.labels.columnsPerPage")}
                    </label>
                    <input
                      type="number"
                      {...register("columns", { valueAsNumber: true })}
                      min="1"
                      max="6"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.columns && (
                      <p className="mt-1 text-sm text-red-600">{errors.columns.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("settings.labels.horizontalSpacing")}
                      </label>
                      <input
                        type="number"
                        {...register("horizontalSpacing", { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("settings.labels.verticalSpacing")}
                      </label>
                      <input
                        type="number"
                        {...register("verticalSpacing", { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Fields */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("settings.labels.displayFields")}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {t("settings.labels.displayFieldsHelper")}
                </p>
                
                {/* Logo Position */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("settings.labels.companyLogoPosition")}
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { value: "top-left", label: t("settings.labels.left") },
                      { value: "top-center", label: t("settings.labels.center") },
                      { value: "top-right", label: t("settings.labels.right") },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border-2 border-transparent has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                      >
                        <input
                          type="radio"
                          {...register("logoPosition")}
                          value={option.value}
                          className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: "showCompanyLogo", label: t("settings.labels.includeCompanyLogo") },
                    { key: "showAssetTag", label: t("settings.labels.includeAssetTag") },
                    { key: "showAssetName", label: t("settings.labels.includeAssetName") },
                    { key: "showCategory", label: t("settings.labels.includeCategory") },
                    { key: "showLocation", label: t("settings.labels.includeLocation") },
                    { key: "showBranch", label: t("settings.labels.includeBranch") },
                    { key: "showDepartment", label: t("settings.labels.includeDepartment") },
                    { key: "showAssetType", label: t("settings.labels.includeAssetType") },
                  ].map((field) => (
                    <label key={field.key} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        {...register(field.key as keyof LabelConfigForm)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {field.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Styling */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("settings.labels.styling")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.labels.qrCodeSize")}
                    </label>
                    <input
                      type="number"
                      {...register("qrCodeSize", { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.qrCodeSize && (
                      <p className="mt-1 text-sm text-red-600">{errors.qrCodeSize.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.labels.assetTagFontSize")}
                    </label>
                    <input
                      type="number"
                      {...register("assetTagFontSize", { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.labels.assetNameFontSize")}
                    </label>
                    <input
                      type="number"
                      {...register("assetNameFontSize", { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.labels.detailsFontSize")}
                    </label>
                    <input
                      type="number"
                      {...register("detailsFontSize", { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      {...register("showBorder")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t("settings.labels.showBorder")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!isDirty || updateMutation.isPending}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("settings.labels.labelPreview")}
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                  <div
                    className={`bg-white ${formValues.showBorder ? 'border-2 border-gray-300' : ''} rounded-lg p-4 text-center`}
                    style={{
                      width: `${formValues.labelWidth * 3.78}px`, // Convert mm to px (1mm ≈ 3.78px at 96dpi)
                      maxWidth: '100%',
                    }}
                  >
                    {/* Company Logo */}
                    {formValues.showCompanyLogo && (
                      <div 
                        className="mb-3"
                        style={{
                          display: 'flex',
                          justifyContent: formValues.logoPosition === 'top-left' ? 'flex-start' : formValues.logoPosition === 'top-right' ? 'flex-end' : 'center',
                        }}
                      >
                        {companyQuery.data?.logoUrl ? (
                          <img
                            src={companyQuery.data.logoUrl}
                            alt={t("settings.labels.logo")}
                            className="h-8 object-contain"
                          />
                        ) : (
                          <div className="h-8 bg-gray-200 rounded flex items-center justify-center" style={{ maxWidth: '120px' }}>
                            <span className="text-gray-500 text-xs">{t("settings.labels.logo")}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* QR Code Placeholder */}
                    <div
                      className="bg-gray-200 mx-auto mb-3 flex items-center justify-center"
                      style={{
                        width: `${formValues.qrCodeSize}px`,
                        height: `${formValues.qrCodeSize}px`,
                        maxWidth: '100%',
                      }}
                    >
                      <span className="text-gray-500 text-xs">{t("settings.labels.qrCode")}</span>
                    </div>

                    {/* Asset Tag */}
                    {formValues.showAssetTag && (
                      <div
                        className="font-bold text-gray-900 mb-1"
                        style={{ fontSize: `${formValues.assetTagFontSize}px` }}
                      >
                        AST-001
                      </div>
                    )}

                    {/* Asset Name */}
                    {formValues.showAssetName && (
                      <div
                        className="text-gray-700 mb-2"
                        style={{ fontSize: `${formValues.assetNameFontSize}px` }}
                      >
                        {t("settings.labels.sampleAsset")}
                      </div>
                    )}

                    {/* Additional Details */}
                    <div className="space-y-1">
                      {formValues.showCategory && (
                        <div
                          className="text-gray-600"
                          style={{ fontSize: `${formValues.detailsFontSize}px` }}
                        >
                          Category: Equipment
                        </div>
                      )}
                      {formValues.showLocation && (
                        <div
                          className="text-gray-600"
                          style={{ fontSize: `${formValues.detailsFontSize}px` }}
                        >
                          Location: Warehouse A
                        </div>
                      )}
                      {formValues.showBranch && (
                        <div
                          className="text-gray-600"
                          style={{ fontSize: `${formValues.detailsFontSize}px` }}
                        >
                          Branch: Main Office
                        </div>
                      )}
                      {formValues.showDepartment && (
                        <div
                          className="text-gray-600"
                          style={{ fontSize: `${formValues.detailsFontSize}px` }}
                        >
                          Department: IT
                        </div>
                      )}
                      {formValues.showAssetType && (
                        <div
                          className="text-gray-600"
                          style={{ fontSize: `${formValues.detailsFontSize}px` }}
                        >
                          Type: Computer
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  {t("settings.labels.previewDisclaimer")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
