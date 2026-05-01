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

export const Route = createFileRoute("/app/settings/asset-classes/")({
  component: AssetClassesPage,
});

const assetClassSchema = z.object({
  assetTypeId: z.number({ required_error: "Asset type is required" }),
  code: z.string().min(1, "Asset class code is required"),
  description: z.string().min(1, "Description is required"),
  accountingAccount: z.string().optional(),
  budgetCode: z.string().optional(),
});

type AssetClassForm = z.infer<typeof assetClassSchema>;

function AssetClassesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [editingAssetClass, setEditingAssetClass] = useState<{
    id: number;
    assetTypeId: number;
    code: string;
    description: string;
    accountingAccount?: string | null;
    budgetCode?: string | null;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const assetTypesQuery = useQuery(trpc.listAssetTypes.queryOptions({}));

  const assetClassesQuery = useQuery(trpc.listAssetClasses.queryOptions({}));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetClassForm>({
    resolver: zodResolver(assetClassSchema),
  });

  const createAssetClassMutation = useMutation(
    trpc.createAssetClass.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetClasses.classCreated"));
        void assetClassesQuery.refetch();
        reset();
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetClasses.failedToCreate"));
      },
    }),
  );

  const updateAssetClassMutation = useMutation(
    trpc.updateAssetClass.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetClasses.classUpdated"));
        void assetClassesQuery.refetch();
        reset();
        setEditingAssetClass(null);
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetClasses.failedToUpdate"));
      },
    }),
  );

  const deleteAssetClassMutation = useMutation(
    trpc.deleteAssetClass.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.assetClasses.classDeleted"));
        void assetClassesQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.assetClasses.failedToDelete"));
      },
    }),
  );

  const onSubmit = (data: AssetClassForm) => {
    if (editingAssetClass) {
      updateAssetClassMutation.mutate({
        id: editingAssetClass.id,
        ...data,
      });
    } else {
      createAssetClassMutation.mutate({
        ...data,
      });
    }
  };

  const handleEdit = (assetClass: {
    id: number;
    assetTypeId: number;
    code: string;
    description: string;
    accountingAccount?: string | null;
    budgetCode?: string | null;
  }) => {
    setEditingAssetClass(assetClass);
    reset({
      assetTypeId: assetClass.assetTypeId,
      code: assetClass.code,
      description: assetClass.description,
      accountingAccount: assetClass.accountingAccount || "",
      budgetCode: assetClass.budgetCode || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = (assetClassId: number) => {
    if (confirm(t("settings.assetClasses.deleteConfirm"))) {
      deleteAssetClassMutation.mutate({
        id: assetClassId,
      });
    }
  };

  const handleCancel = () => {
    setEditingAssetClass(null);
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
                {t("settings.assetClasses.title")}
              </h1>
              <p className="text-gray-600">
                {t("settings.assetClasses.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              disabled={!assetTypesQuery.data?.assetTypes.length}
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("settings.assetClasses.addClass")}
            </button>
          </div>
          {!assetTypesQuery.data?.assetTypes.length && (
            <p className="mt-2 text-sm text-amber-600">
              {t("settings.assetClasses.pleaseCreateAssetType")}
            </p>
          )}
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingAssetClass
                ? t("settings.assetClasses.editClass")
                : t("settings.assetClasses.newAssetClass")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetClasses.assetType")} *
                  </label>
                  <select
                    {...register("assetTypeId", { valueAsNumber: true })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {t("settings.assetClasses.selectAssetType")}
                    </option>
                    {assetTypesQuery.data?.assetTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.code} - {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.assetTypeId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.assetTypeId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetClasses.classCode")} *
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.assetClasses.classCodePlaceholder",
                    )}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("settings.assetClasses.classCodeRequired")}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetClasses.classDescription")} *
                  </label>
                  <input
                    type="text"
                    {...register("description")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.assetClasses.classDescriptionPlaceholder",
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetClasses.accountingAccount")}
                  </label>
                  <input
                    type="text"
                    {...register("accountingAccount")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.assetClasses.accountNumberPlaceholder",
                    )}
                  />
                  {errors.accountingAccount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.accountingAccount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.assetClasses.budgetCode")}
                  </label>
                  <input
                    type="text"
                    {...register("budgetCode")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.assetClasses.budgetCodePlaceholder",
                    )}
                  />
                  {errors.budgetCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.budgetCode.message}
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
                    createAssetClassMutation.isPending ||
                    updateAssetClassMutation.isPending
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {editingAssetClass
                    ? t("settings.assetClasses.updateAssetClass")
                    : t("settings.assetClasses.createAssetClass")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Asset Classes List */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {assetClassesQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">
              {t("settings.assetClasses.loading")}
            </div>
          ) : assetClassesQuery.data?.assetClasses.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-4 text-gray-500">
                {t("settings.assetClasses.noAssetClasses")}
              </p>
              {assetTypesQuery.data?.assetTypes.length ? (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  {t("settings.assetClasses.createFirst")}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  {t("settings.assetClasses.createAssetTypeFirst")}
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetClasses.assetType")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetTypes.code")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetClasses.description")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetClasses.accountNumber")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetClasses.budgetCode")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.assetClasses.subclasses")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assetClassesQuery.data?.assetClasses.map((assetClass) => (
                    <tr key={assetClass.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assetClass.assetType.code} -{" "}
                        {assetClass.assetType.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {assetClass.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assetClass.description}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assetClass.accountingAccount || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assetClass.budgetCode || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assetClass.subclassCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(assetClass)}
                          className="mr-4 text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="inline h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assetClass.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={
                            assetClass.subclassCount > 0 ||
                            assetClass.assetCount > 0
                          }
                        >
                          <Trash2 className="inline h-4 w-4" />
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
