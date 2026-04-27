import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { ArrowLeft, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/asset-types/")({
  component: AssetTypesPage,
});

const assetTypeSchema = z.object({
  name: z.string().min(1, "Asset type name is required"),
  code: z.string().min(1, "Asset type code is required"),
  acronym: z.string().optional(),
  isDepreciable: z.boolean().default(true),
  accountingAccount: z.string().optional(),
});

type AssetTypeForm = z.infer<typeof assetTypeSchema>;

function AssetTypesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [editingAssetType, setEditingAssetType] = useState<{ 
    id: number; 
    name: string; 
    code: string;
    acronym?: string | null;
    isDepreciable: boolean;
    accountingAccount?: string | null;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const assetTypesQuery = useQuery(
    trpc.listAssetTypes.queryOptions({
      authToken: authToken || "",
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetTypeForm>({
    resolver: zodResolver(assetTypeSchema),
  });

  const createAssetTypeMutation = useMutation(
    trpc.createAssetType.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetTypes.assetTypeCreated"));
        void assetTypesQuery.refetch();
        reset();
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetTypes.failedToCreate"));
      },
    })
  );

  const updateAssetTypeMutation = useMutation(
    trpc.updateAssetType.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetTypes.assetTypeUpdated"));
        void assetTypesQuery.refetch();
        reset();
        setEditingAssetType(null);
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetTypes.failedToUpdate"));
      },
    })
  );

  const deleteAssetTypeMutation = useMutation(
    trpc.deleteAssetType.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetTypes.assetTypeDeleted"));
        void assetTypesQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetTypes.failedToDelete"));
      },
    })
  );

  const onSubmit = (data: AssetTypeForm) => {
    if (editingAssetType) {
      updateAssetTypeMutation.mutate({
        authToken: authToken || "",
        id: editingAssetType.id,
        ...data,
      });
    } else {
      createAssetTypeMutation.mutate({
        authToken: authToken || "",
        ...data,
      });
    }
  };

  const handleEdit = (assetType: { 
    id: number; 
    name: string; 
    code: string;
    acronym?: string | null;
    isDepreciable: boolean;
    accountingAccount?: string | null;
  }) => {
    setEditingAssetType(assetType);
    reset({ 
      name: assetType.name, 
      code: assetType.code,
      acronym: assetType.acronym || "",
      isDepreciable: assetType.isDepreciable,
      accountingAccount: assetType.accountingAccount || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = (assetTypeId: number) => {
    if (confirm(t("settings.assetTypes.deleteConfirm"))) {
      deleteAssetTypeMutation.mutate({
        authToken: authToken || "",
        id: assetTypeId,
      });
    }
  };

  const handleCancel = () => {
    setEditingAssetType(null);
    reset();
    setIsFormOpen(false);
  };

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("settings.assetTypes.title")}</h1>
              <p className="text-gray-600">
                {t("settings.assetTypes.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("settings.assetTypes.addAssetType")}
            </button>
          </div>
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAssetType ? t("settings.assetTypes.editAssetType") : t("settings.assetTypes.newAssetType")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.assetTypes.typeName")} *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.assetTypes.typeNamePlaceholder")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{t("settings.assetTypes.typeNameRequired")}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.assetTypes.typeCode")} * <span className="text-xs text-gray-500">({t("settings.assetTypes.typeCodeNumerical")})</span>
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.assetTypes.typeCodePlaceholder")}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{t("settings.assetTypes.typeCodeRequired")}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.assetTypes.acronym")}
                  </label>
                  <input
                    type="text"
                    {...register("acronym")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.assetTypes.acronymPlaceholder")}
                  />
                  {errors.acronym && (
                    <p className="mt-1 text-sm text-red-600">{errors.acronym.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.assetTypes.accountingAccount")}
                  </label>
                  <input
                    type="text"
                    {...register("accountingAccount")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.assetTypes.accountingAccountPlaceholder")}
                  />
                  {errors.accountingAccount && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountingAccount.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{t("settings.assetTypes.depreciableAssetType")}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t("settings.assetTypes.depreciableHelper")}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("isDepreciable")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createAssetTypeMutation.isPending || updateAssetTypeMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingAssetType ? t("common.update") : t("common.create")} {t("settings.assetTypes.title").slice(0, -1)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Asset Types List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {assetTypesQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">{t("settings.assetTypes.loading")}</div>
          ) : assetTypesQuery.data?.assetTypes.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t("settings.assetTypes.noAssetTypes")}</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("settings.assetTypes.createFirst")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetTypes.code")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetTypes.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetTypes.acronym")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetTypes.account")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetTypes.depreciable")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetTypes.assets")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assetTypesQuery.data?.assetTypes.map((assetType) => (
                    <tr key={assetType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assetType.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assetType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assetType.acronym || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assetType.accountingAccount || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assetType.isDepreciable ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t("settings.assetTypes.yes")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {t("settings.assetTypes.no")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assetType.assetCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(assetType)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(assetType.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={assetType.assetCount > 0}
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Suggested Asset Types */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">{t("settings.assetTypes.suggestedTypes")}</h3>
          <p className="text-sm text-blue-700 mb-3">
            {t("settings.assetTypes.suggestedHelper")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-600">
            <div>• {t("settings.assetTypes.machinery")}</div>
            <div>• {t("settings.assetTypes.furniture")}</div>
            <div>• {t("settings.assetTypes.technology")}</div>
            <div>• {t("settings.assetTypes.vehicles")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
