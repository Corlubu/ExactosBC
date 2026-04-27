import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { Building, ArrowLeft, Save, Upload, Copy, RefreshCw, Globe, Mail, Key, Palette } from "lucide-react";

export const Route = createFileRoute("/app/settings/company/")({
  component: CompanySettingsPage,
});

const companySettingsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  // Branding
  logoUrl: z.string().optional(),
  brandColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #3B82F6)")
    .optional()
    .or(z.literal(""))
    .transform(val => val === "" ? undefined : val),
  // Regional Settings
  defaultCurrency: z.string().min(1, "Currency is required"),
  defaultTimezone: z.string().optional(),
  defaultLanguage: z.string().min(1, "Language is required"),
  // Email Notifications
  emailNotificationsEnabled: z.boolean(),
  notificationEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  // API Access
  apiKey: z.string().optional(),
});

type CompanySettingsForm = z.infer<typeof companySettingsSchema>;

function CompanySettingsPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Fetch current company settings
  const companyQuery = useQuery(
    trpc.getCompanySettings.queryOptions({
      authToken: authToken || "",
    })
  );

  const getPresignedUrlMutation = useMutation(
    trpc.getPresignedUrl.mutationOptions()
  );

  // Update mutation
  const updateMutation = useMutation(
    trpc.updateCompanySettings.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.company.updateSuccess"));
        void companyQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.company.updateError"));
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<CompanySettingsForm>({
    resolver: zodResolver(companySettingsSchema),
    values: companyQuery.data
      ? {
          name: companyQuery.data.name,
          logoUrl: companyQuery.data.logoUrl || undefined,
          brandColor: companyQuery.data.brandColor || undefined,
          defaultCurrency: companyQuery.data.defaultCurrency,
          defaultTimezone: companyQuery.data.defaultTimezone || undefined,
          defaultLanguage: companyQuery.data.defaultLanguage,
          emailNotificationsEnabled: companyQuery.data.emailNotificationsEnabled,
          notificationEmail: companyQuery.data.notificationEmail || undefined,
          apiKey: companyQuery.data.apiKey || undefined,
        }
      : undefined,
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.company.selectImageFile"));
      return;
    }

    // Validate file size (max 5MB for logo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.company.fileSizeError"));
      return;
    }

    setSelectedFile(file);
    setLogoUrl(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !authToken) return;

    setIsUploading(true);
    try {
      // Get presigned URL
      const { uploadUrl, publicUrl } = await getPresignedUrlMutation.mutateAsync({
        authToken,
        fileName: selectedFile.name,
        fileType: "LOGO",
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

      setLogoUrl(publicUrl);
      setValue("logoUrl", publicUrl, { shouldDirty: true });
      toast.success(t("settings.company.uploadSuccess"));
    } catch (error) {
      toast.error(t("settings.company.uploadError"));
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setLogoUrl(null);
    setValue("logoUrl", undefined, { shouldDirty: true });
  };

  const handleGenerateApiKey = () => {
    // Generate a random API key
    const newApiKey = `ak_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setValue("apiKey", newApiKey, { shouldDirty: true });
    toast.success(t("settings.company.apiKeyGenerated"));
  };

  const handleCopyApiKey = () => {
    const apiKey = watch("apiKey");
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success(t("settings.company.apiKeyCopied"));
    }
  };

  const onSubmit = (data: CompanySettingsForm) => {
    updateMutation.mutate({
      authToken: authToken || "",
      name: data.name,
      logoUrl: data.logoUrl,
      brandColor: data.brandColor,
      defaultCurrency: data.defaultCurrency,
      defaultTimezone: data.defaultTimezone,
      defaultLanguage: data.defaultLanguage,
      emailNotificationsEnabled: data.emailNotificationsEnabled,
      notificationEmail: data.notificationEmail || undefined,
      apiKey: data.apiKey,
    });
  };

  const handleCancel = () => {
    reset();
  };

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
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{t("settings.company.failedToLoad")}</p>
            <button
              onClick={() => companyQuery.refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t("settings.company.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/settings" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("settings.backToSettings")}
          </button>
          <div className="flex items-center mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("settings.company.title")}</h1>
              <p className="text-gray-600 mt-1">
                {t("settings.company.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("settings.company.companyInformation")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.companyName")} *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("settings.company.companyNamePlaceholder")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.companyId")}
                </label>
                <input
                  type="text"
                  value={companyQuery.data?.id || ""}
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("settings.company.companyIdDescription")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.accountCreated")}
                </label>
                <input
                  type="text"
                  value={
                    companyQuery.data?.createdAt
                      ? new Date(companyQuery.data.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : ""
                  }
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Palette className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t("settings.company.branding")}
              </h2>
            </div>
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.companyLogo")}
                </label>
                {!logoUrl && !watch("logoUrl") ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1">
                        <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {selectedFile ? selectedFile.name : t("settings.company.clickToSelectLogo")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {t("settings.company.logoFileTypes")}
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
                    {selectedFile && !logoUrl && (
                      <div className="flex items-center space-x-4 mt-4">
                        <button
                          type="button"
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isUploading ? t("settings.company.uploading") : t("settings.company.uploadLogo")}
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
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
                      src={logoUrl || watch("logoUrl") || ""}
                      alt="Company logo"
                      className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-gray-50"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-green-600 mb-2">{t("settings.company.logoUploaded")}</p>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {t("settings.company.removeLogo")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.brandColor")}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    {...register("brandColor")}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    {...register("brandColor")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.company.brandColorPlaceholder")}
                  />
                </div>
                {errors.brandColor && (
                  <p className="mt-1 text-sm text-red-600">{errors.brandColor.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t("settings.company.brandColorDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t("settings.company.regionalSettings")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.defaultCurrency")} *
                </label>
                <select
                  {...register("defaultCurrency")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">{t("currencies.USD")}</option>
                  <option value="EUR">{t("currencies.EUR")}</option>
                  <option value="GBP">{t("currencies.GBP")}</option>
                  <option value="JPY">{t("currencies.JPY")}</option>
                  <option value="CAD">{t("currencies.CAD")}</option>
                  <option value="AUD">{t("currencies.AUD")}</option>
                  <option value="CHF">{t("currencies.CHF")}</option>
                  <option value="CNY">{t("currencies.CNY")}</option>
                  <option value="INR">{t("currencies.INR")}</option>
                  <option value="MXN">{t("currencies.MXN")}</option>
                </select>
                {errors.defaultCurrency && (
                  <p className="mt-1 text-sm text-red-600">{errors.defaultCurrency.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.defaultLanguage")} *
                </label>
                <select
                  {...register("defaultLanguage")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">{t("languages.en")}</option>
                  <option value="es">{t("languages.es")}</option>
                  <option value="fr">{t("languages.fr")}</option>
                  <option value="de">{t("languages.de")}</option>
                  <option value="it">{t("languages.it")}</option>
                  <option value="pt">{t("languages.pt")}</option>
                  <option value="zh">{t("languages.zh")}</option>
                  <option value="ja">{t("languages.ja")}</option>
                  <option value="ko">{t("languages.ko")}</option>
                  <option value="ar">{t("languages.ar")}</option>
                </select>
                {errors.defaultLanguage && (
                  <p className="mt-1 text-sm text-red-600">{errors.defaultLanguage.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.defaultTimezone")}
                </label>
                <select
                  {...register("defaultTimezone")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("settings.company.selectTimezone")}</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="America/Anchorage">Alaska</option>
                  <option value="Pacific/Honolulu">Hawaii</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="Europe/Rome">Rome</option>
                  <option value="Europe/Madrid">Madrid</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Asia/Hong_Kong">Hong Kong</option>
                  <option value="Asia/Singapore">Singapore</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Australia/Sydney">Sydney</option>
                  <option value="Pacific/Auckland">Auckland</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t("settings.company.emailNotifications")}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {t("settings.company.enableEmailNotifications")}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("settings.company.emailNotificationsDescription")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("emailNotificationsEnabled")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.notificationEmail")}
                </label>
                <input
                  type="email"
                  {...register("notificationEmail")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("settings.company.notificationEmailPlaceholder")}
                />
                {errors.notificationEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.notificationEmail.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t("settings.company.notificationEmailDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* API Access */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Key className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t("settings.company.apiAccess")}
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.company.apiKey")}
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      {...register("apiKey")}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder={t("settings.company.noApiKeyGenerated")}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyApiKey}
                    disabled={!watch("apiKey")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Copy API key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateApiKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Generate new API key"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t("settings.company.apiKeyDescription")}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  {t("settings.company.apiDocumentation")}
                </h3>
                <p className="text-sm text-blue-700">
                  {t("settings.company.apiDocumentationDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pb-8">
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
    </div>
  );
}
