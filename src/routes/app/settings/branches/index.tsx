import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { ArrowLeft, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/branches/")({
  component: BranchesPage,
});

function BranchesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [editingBranch, setEditingBranch] = useState<{
    id: number;
    name: string;
    code: string;
    address?: string | null;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const branchSchema = z.object({
    name: z.string().min(1, t("settings.branches.branchNameRequired")),
    code: z.string().min(1, t("settings.branches.branchCodeRequired")),
    address: z.string().optional(),
  });

  type BranchForm = z.infer<typeof branchSchema>;

  const branchesQuery = useQuery(trpc.listBranches.queryOptions({}));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
  });

  const createBranchMutation = useMutation(
    trpc.createBranch.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.branches.branchCreated"));
        void branchesQuery.refetch();
        reset();
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.branches.failedToCreate"));
      },
    }),
  );

  const updateBranchMutation = useMutation(
    trpc.updateBranch.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.branches.branchUpdated"));
        void branchesQuery.refetch();
        reset();
        setEditingBranch(null);
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.branches.failedToUpdate"));
      },
    }),
  );

  const deleteBranchMutation = useMutation(
    trpc.deleteBranch.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.branches.branchDeleted"));
        void branchesQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.branches.failedToDelete"));
      },
    }),
  );

  const onSubmit = (data: BranchForm) => {
    if (editingBranch) {
      updateBranchMutation.mutate({
        id: editingBranch.id,
        ...data,
      });
    } else {
      createBranchMutation.mutate({
        ...data,
      });
    }
  };

  const handleEdit = (branch: {
    id: number;
    name: string;
    code: string;
    address?: string | null;
  }) => {
    setEditingBranch(branch);
    reset({
      name: branch.name,
      code: branch.code,
      address: branch.address || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = (branchId: number) => {
    if (confirm(t("settings.branches.deleteConfirm"))) {
      deleteBranchMutation.mutate({
        id: branchId,
      });
    }
  };

  const handleCancel = () => {
    setEditingBranch(null);
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
                {t("settings.branches.title")}
              </h1>
              <p className="text-gray-600">{t("settings.branches.subtitle")}</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("settings.branches.addBranch")}
            </button>
          </div>
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingBranch
                ? t("settings.branches.editBranch")
                : t("settings.branches.newBranch")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.branches.branchName")}
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t("settings.branches.branchNamePlaceholder")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.branches.branchCode")}{" "}
                    <span className="text-xs text-gray-500">
                      {t("settings.branches.branchCodeNumerical")}
                    </span>
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t("settings.branches.branchCodePlaceholder")}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.branches.address")}
                  </label>
                  <input
                    type="text"
                    {...register("address")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t("settings.branches.addressPlaceholder")}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address.message}
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
                    createBranchMutation.isPending ||
                    updateBranchMutation.isPending
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {editingBranch
                    ? t("settings.branches.updateBranch")
                    : t("settings.branches.createBranch")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Branches List */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {branchesQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">
              {t("settings.branches.loading")}
            </div>
          ) : branchesQuery.data?.branches.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-4 text-gray-500">
                {t("settings.branches.noBranches")}
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {t("settings.branches.createFirst")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.branches.code")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.branches.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.branches.address")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.branches.departments")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.branches.assets")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {branchesQuery.data?.branches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {branch.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {branch.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {branch.address || (
                          <span className="italic text-gray-400">
                            {t("settings.branches.noAddress")}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {branch.departmentCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {branch.assetCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(branch)}
                          className="mr-4 text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="inline h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={
                            branch.departmentCount > 0 || branch.assetCount > 0
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
