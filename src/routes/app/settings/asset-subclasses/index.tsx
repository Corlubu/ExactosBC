import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { ArrowLeft, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/settings/asset-subclasses/")({
  component: AssetSubclassesPage,
});

const assetSubclassSchema = z.object({
  classId: z.number({ required_error: "Asset class is required" }),
  description: z.string().min(1, "Description is required"),
  abbreviation: z.string().optional(),
});

type AssetSubclassForm = z.infer<typeof assetSubclassSchema>;

function AssetSubclassesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [editingAssetSubclass, setEditingAssetSubclass] = useState<{
    id: number;
    classId: number;
    description: string;
    abbreviation?: string | null;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const assetClassesQuery = useQuery(
    trpc.listAssetClasses.queryOptions({
      authToken: authToken || "",
    })
  );

  const assetSubclassesQuery = useQuery(
    trpc.listAssetSubclasses.queryOptions({
      authToken: authToken || "",
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetSubclassForm>({
    resolver: zodResolver(assetSubclassSchema),
  });

  const createAssetSubclassMutation = useMutation(
    trpc.createAssetSubclass.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetSubclasses.subclassCreated"));
        void assetSubclassesQuery.refetch();
        reset();
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetSubclasses.failedToCreate"));
      },
    })
  );

  const updateAssetSubclassMutation = useMutation(
    trpc.updateAssetSubclass.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetSubclasses.subclassUpdated"));
        void assetSubclassesQuery.refetch();
        reset();
        setEditingAssetSubclass(null);
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetSubclasses.failedToUpdate"));
      },
    })
  );

  const deleteAssetSubclassMutation = useMutation(
    trpc.deleteAssetSubclass.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetSubclasses.subclassDeleted"));
        void assetSubclassesQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetSubclasses.failedToDelete"));
      },
    })
  );

  const onSubmit = (data: AssetSubclassForm) => {
    if (editingAssetSubclass) {
      updateAssetSubclassMutation.mutate({
        authToken: authToken || "",
        id: editingAssetSubclass.id,
        ...data,
      });
    } else {
      createAssetSubclassMutation.mutate({
        authToken: authToken || "",
        ...data,
      });
    }
  };

  const handleEdit = (assetSubclass: {
    id: number;
    classId: number;
    description: string;
    abbreviation?: string | null;
  }) => {
    setEditingAssetSubclass(assetSubclass);
    reset({
      classId: assetSubclass.classId,
      description: assetSubclass.description,
      abbreviation: assetSubclass.abbreviation || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = (assetSubclassId: number) => {
    if (
      confirm(
        t("settings.assetSubclasses.deleteConfirm")
      )
    ) {
      deleteAssetSubclassMutation.mutate({
        authToken: authToken || "",
        id: assetSubclassId,
      });
    }
  };

  const handleCancel = () => {
    setEditingAssetSubclass(null);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("settings.assetSubclasses.title")}
              </h1>
              <p className="text-gray-600">
                {t("settings.assetSubclasses.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!assetClassesQuery.data?.assetClasses.length}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("settings.assetSubclasses.addSubclass")}
            </button>
          </div>
          {!assetClassesQuery.data?.assetClasses.length && (
            <p className="mt-2 text-sm text-amber-600">
              {t("settings.assetSubclasses.pleaseCreateAssetClass")}
            </p>
          )}
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAssetSubclass ? t("settings.assetSubclasses.editSubclass") : t("settings.assetSubclasses.newSubclass")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.assetSubclasses.assetClass")} *
                  </label>
                  <select
                    {...register("classId", { valueAsNumber: true })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t("settings.assetSubclasses.selectAssetClass")}</option>
                    {assetClassesQuery.data?.assetClasses.map((assetClass) => (
                      <option key={assetClass.id} value={assetClass.id}>
                        {assetClass.assetType.name} → {assetClass.code} - {assetClass.description}
                      </option>
                    ))}
                  </select>
                  {errors.classId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.classId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.assetSubclasses.subclassDescription")} *
                  </label>
                  <input
                    type="text"
                    {...register("description")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.assetSubclasses.subclassDescriptionPlaceholder")}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("settings.assetSubclasses.subclassDescriptionRequired")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.assetSubclasses.abbreviation")}
                  </label>
                  <input
                    type="text"
                    {...register("abbreviation")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.assetSubclasses.abbreviationPlaceholder")}
                  />
                  {errors.abbreviation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.abbreviation.message}
                    </p>
                  )}
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
                  disabled={
                    createAssetSubclassMutation.isPending ||
                    updateAssetSubclassMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingAssetSubclass ? t("common.update") : t("common.create")} {t("settings.assetSubclasses.title").slice(0, -2)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Asset Subclasses List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {assetSubclassesQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">
              {t("settings.assetSubclasses.loading")}
            </div>
          ) : assetSubclassesQuery.data?.assetSubclasses.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t("settings.assetSubclasses.noSubclasses")}</p>
              {assetClassesQuery.data?.assetClasses.length ? (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t("settings.assetSubclasses.createFirst")}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  {t("settings.assetSubclasses.createAssetClassFirst")}
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetSubclasses.assetType")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetSubclasses.assetClass")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetSubclasses.description")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.assetSubclasses.abbreviation")}
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
                  {assetSubclassesQuery.data?.assetSubclasses.map((subclass) => (
                    <tr key={subclass.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subclass.class.assetType.code} - {subclass.class.assetType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subclass.class.code} - {subclass.class.description}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {subclass.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subclass.abbreviation || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subclass.assetCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(subclass)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(subclass.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={subclass.assetCount > 0}
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
      </div>
    </div>
  );
}
