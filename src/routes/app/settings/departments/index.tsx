import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { ArrowLeft, Plus, Pencil, Trash2, Folder } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/settings/departments/")({
  component: DepartmentsPage,
});

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().min(1, "Department code is required"),
  branchId: z.number({ required_error: "Branch is required" }),
  departmentHeadId: z.number().optional().nullable(),
});

type DepartmentForm = z.infer<typeof departmentSchema>;

function DepartmentsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [editingDepartment, setEditingDepartment] = useState<{
    id: number;
    name: string;
    code: string;
    branchId: number;
    departmentHeadId?: number | null;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const branchesQuery = useQuery(trpc.listBranches.queryOptions({}));

  const departmentsQuery = useQuery(trpc.listDepartments.queryOptions({}));

  const usersQuery = useQuery(trpc.listUsers.queryOptions({}));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
  });

  const createDepartmentMutation = useMutation(
    trpc.createDepartment.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.departments.departmentCreated"));
        void departmentsQuery.refetch();
        reset();
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.departments.failedToCreate"));
      },
    }),
  );

  const updateDepartmentMutation = useMutation(
    trpc.updateDepartment.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.departments.departmentUpdated"));
        void departmentsQuery.refetch();
        reset();
        setEditingDepartment(null);
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || t("settings.departments.failedToUpdate"));
      },
    }),
  );

  const deleteDepartmentMutation = useMutation(
    trpc.deleteDepartment.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.departments.departmentDeleted"));
        void departmentsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.departments.failedToDelete"));
      },
    }),
  );

  const onSubmit = (data: DepartmentForm) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({
        id: editingDepartment.id,
        ...data,
      });
    } else {
      createDepartmentMutation.mutate({
        ...data,
      });
    }
  };

  const handleEdit = (department: {
    id: number;
    name: string;
    code: string;
    branchId: number;
    departmentHeadId?: number | null;
  }) => {
    setEditingDepartment(department);
    reset({
      name: department.name,
      code: department.code,
      branchId: department.branchId,
      departmentHeadId: department.departmentHeadId,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (departmentId: number) => {
    if (confirm(t("settings.departments.deleteConfirm"))) {
      deleteDepartmentMutation.mutate({
        id: departmentId,
      });
    }
  };

  const handleCancel = () => {
    setEditingDepartment(null);
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
                {t("settings.departments.title")}
              </h1>
              <p className="text-gray-600">
                {t("settings.departments.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              disabled={!branchesQuery.data?.branches.length}
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("settings.departments.addDepartment")}
            </button>
          </div>
          {!branchesQuery.data?.branches.length && (
            <p className="mt-2 text-sm text-amber-600">
              {t("settings.departments.pleaseCreateBranch")}
            </p>
          )}
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingDepartment
                ? t("settings.departments.editDepartment")
                : t("settings.departments.newDepartment")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.departments.branch")} *
                  </label>
                  <select
                    {...register("branchId", { valueAsNumber: true })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {t("settings.departments.selectBranch")}
                    </option>
                    {branchesQuery.data?.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.code} - {branch.name}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.branchId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.departments.departmentHead")}
                  </label>
                  <select
                    {...register("departmentHeadId", {
                      setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                    })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    disabled={usersQuery.isLoading}
                  >
                    <option value="">
                      {t("settings.departments.noDepartmentHead")}
                    </option>
                    {usersQuery.data?.users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors.departmentHeadId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.departmentHeadId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.departments.departmentName")} *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.departments.departmentNamePlaceholder",
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("settings.departments.departmentNameRequired")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("settings.departments.departmentCode")} *{" "}
                    <span className="text-xs text-gray-500">
                      ({t("settings.departments.departmentCodeNumerical")})
                    </span>
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder={t(
                      "settings.departments.departmentCodePlaceholder",
                    )}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("settings.departments.departmentCodeRequired")}
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
                    createDepartmentMutation.isPending ||
                    updateDepartmentMutation.isPending
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {editingDepartment ? t("common.update") : t("common.create")}{" "}
                  {t("settings.departments.title").slice(0, -1)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Departments List */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {departmentsQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">
              {t("settings.departments.loading")}
            </div>
          ) : departmentsQuery.data?.departments.length === 0 ? (
            <div className="p-8 text-center">
              <Folder className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-4 text-gray-500">
                {t("settings.departments.noDepartments")}
              </p>
              {branchesQuery.data?.branches.length ? (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  {t("settings.departments.createFirst")}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  {t("settings.departments.createBranchFirst")}
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.departments.branch")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.departments.code")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.departments.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.departments.departmentHead")}
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
                  {departmentsQuery.data?.departments.map((department) => (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {department.branch.code} - {department.branch.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {department.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {department.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {department.departmentHead ? (
                          <span>
                            {department.departmentHead.firstName}{" "}
                            {department.departmentHead.lastName}
                          </span>
                        ) : (
                          <span className="italic text-gray-400">
                            {t("settings.departments.notAssigned")}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {department.assetCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(department)}
                          className="mr-4 text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="inline h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(department.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={department.assetCount > 0}
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
