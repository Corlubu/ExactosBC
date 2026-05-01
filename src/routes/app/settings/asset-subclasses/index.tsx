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

  const assetClassesQuery = useQuery(trpc.listAssetClasses.queryOptions({}));

  const assetSubclassesQuery = useQuery(
    trpc.listAssetSubclasses.queryOptions({}),
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
        toast.error(
          error.message || t("settings.assetSubclasses.failedToCreate"),
        );
      },
    }),
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
        toast.error(
          error.message || t("settings.assetSubclasses.failedToUpdate"),
        );
      },
    }),
  );

  const deleteAssetSubclassMutation = useMutation(
    trpc.deleteAssetSubclass.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetSubclasses.subclassDeleted"));
        void assetSubclassesQuery.refetch();
      },
      onError: (error) => {
        toast.error(
          error.message || t("settings.assetSubclasses.failedToDelete"),
        );
      },
    }),
  );

  const onSubmit = (data: AssetSubclassForm) => {
    if (editingAssetSubclass) {
      updateAssetSubclassMutation.mutate({
        id: editingAssetSubclass.id,
        ...data,
      });
    } else {
      createAssetSubclassMutation.mutate({
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
    if (confirm(t("settings.assetSubclasses.deleteConfirm"))) {
      deleteAssetSubclassMutation.mutate({
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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/settings" })}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {t("settings.backToSettings")}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {t("settings.assetSubclasses.title")}
              </h1>
              <p className="text-gray-600">
                {t("settings.assetSubclasses.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              disabled={!assetClassesQuery.data?.assetClasses.length}
            >
              <Plus className="mr-2 h-5 w-5" />
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
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingAssetSubclass
                ? t("settings.assetSubclasses.editSubclass")
                : t("settings.assetSubclasses.newSubclass")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetSubclasses.assetClass")} *
                  </label>
                  <select
                    {...register("classId", { valueAsNumber: true })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {t("settings.assetSubclasses.selectAssetClass")}
                    </option>
                    {assetClassesQuery.data?.assetClasses.map((assetClass) => (
                      <option key={assetClass.id} value={assetClass.id}>
                        {assetClass.assetType.name} → {assetClass.code} -{" "}
                        {assetClass.description}
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
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetSubclasses.subclassDescription")} *
                  </label>
                  <input
                    type="text"
                    {...register("description")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.assetSubclasses.subclassDescriptionPlaceholder",
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {t(
                        "settings.assetSubclasses.subclassDescriptionRequired",
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetSubclasses.abbreviation")}
                  </label>
                  <input
                    type="text"
                    {...register("abbreviation")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.assetSubclasses.abbreviationPlaceholder",
                    )}
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
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    createAssetSubclassMutation.isPending ||
                    updateAssetSubclassMutation.isPending
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {editingAssetSubclass
                    ? t("common.update")
                    : t("common.create")}{" "}
                  {t("settings.assetSubclasses.title").slice(0, -2)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Asset Subclasses List */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {assetSubclassesQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">
              {t("settings.assetSubclasses.loading")}
            </div>
          ) : assetSubclassesQuery.data?.assetSubclasses.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-4 text-gray-500">
                {t("settings.assetSubclasses.noSubclasses")}
              </p>
              {assetClassesQuery.data?.assetClasses.length ? (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="font-medium text-blue-600 hover:text-blue-700"
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetSubclasses.assetType")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetSubclasses.assetClass")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetSubclasses.description")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetSubclasses.abbreviation")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetTypes.assets")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assetSubclassesQuery.data?.assetSubclasses.map(
                    (subclass) => (
                      <tr key={subclass.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {subclass.class.assetType.code} -{" "}
                          {subclass.class.assetType.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {subclass.class.code} - {subclass.class.description}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {subclass.description}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {subclass.abbreviation || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {subclass.assetCount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(subclass)}
                            className="mr-4 text-blue-600 hover:text-blue-900"
                          >
                            <Pencil className="inline h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subclass.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={subclass.assetCount > 0}
                          >
                            <Trash2 className="inline h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
