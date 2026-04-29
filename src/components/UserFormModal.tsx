import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// IMPORTANTE: Hooks Nativos de TanStack
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useLanguage } from "~/contexts/LanguageContext";

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roleId: z.number().nullable().optional(),
  position: z.string().optional().or(z.literal("")),
  identificationNumber: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  branchId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any; // Mantenido genérico por brevedad
}

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: UserFormModalProps) {
  const { t } = useLanguage();
  const trpc = useTRPC();

  // NUEVO: Instancia nativa
  const queryClient = useQueryClient();

  const isEditMode = !!user;

  // Consultas limpias nativas
  const rolesQuery = useQuery(trpc.listRoles.queryOptions());
  const branchesQuery = useQuery(trpc.listBranches.queryOptions());

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { isActive: true },
  });

  const selectedBranchId = watch("branchId");

  // Consulta optimizada: Solo carga departamentos si hay sucursal seleccionada
  const departmentsQuery = useQuery({
    ...trpc.listDepartments.queryOptions(),
    enabled: !!selectedBranchId,
  });

  const availableDepartments = selectedBranchId
    ? departmentsQuery.data?.departments.filter(
        (dept) => dept.branchId === selectedBranchId,
      )
    : [];

  const createMutation = useMutation(
    trpc.createUser.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.users.userCreated"));
        // NUEVO: Recarga la tabla de usuarios
        queryClient.invalidateQueries({ queryKey: [["listUsers"]] });
        onSuccess();
        onClose();
      },
      onError: (error) => toast.error(error.message || "Failed to create user"),
    }),
  );

  const updateMutation = useMutation(
    trpc.updateUser.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.users.userUpdated"));
        // NUEVO: Recarga la tabla de usuarios
        queryClient.invalidateQueries({ queryKey: [["listUsers"]] });
        onSuccess();
        onClose();
      },
      onError: (error) => toast.error(error.message || "Failed to update user"),
    }),
  );

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          email: user.email,
          password: "",
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.role?.id || null,
          position: user.position || "",
          identificationNumber: user.identificationNumber || "",
          isActive: user.isActive,
          branchId: user.branch?.id || null,
          departmentId: user.department?.id || null,
        });
      } else {
        reset({ isActive: true });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: UserFormData) => {
    if (isEditMode && user) {
      updateMutation.mutate({
        userId: user.id,
        email: data.email !== user.email ? data.email : undefined,
        password: data.password || undefined,
        firstName:
          data.firstName !== user.firstName ? data.firstName : undefined,
        lastName: data.lastName !== user.lastName ? data.lastName : undefined,
        roleId: data.roleId !== user.role?.id ? data.roleId : undefined,
        position: data.position || null,
        identificationNumber: data.identificationNumber || null,
        isActive: data.isActive !== user.isActive ? data.isActive : undefined,
        branchId: data.branchId !== user.branch?.id ? data.branchId : undefined,
        departmentId:
          data.departmentId !== user.department?.id
            ? data.departmentId
            : undefined,
      });
    } else {
      if (!data.password)
        return toast.error("Password is required for new users");
      createMutation.mutate({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId || undefined,
        position: data.position || undefined,
        identificationNumber: data.identificationNumber || undefined,
        isActive: data.isActive,
        branchId: data.branchId || undefined,
        departmentId: data.departmentId || undefined,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {isEditMode
                      ? t("settings.users.editUser")
                      : t("settings.users.addUser")}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 transition-colors hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Formulario Original... */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("auth.emailAddress")} *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("auth.password")} {!isEditMode && "*"}
                    </label>
                    <input
                      type="password"
                      {...register("password")}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        isEditMode
                          ? t("settings.users.leaveBlankPassword")
                          : t("auth.enterPassword")
                      }
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("auth.firstName")} *
                      </label>
                      <input
                        type="text"
                        {...register("firstName")}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("auth.lastName")} *
                      </label>
                      <input
                        type="text"
                        {...register("lastName")}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("settings.users.role")}
                    </label>
                    <select
                      {...register("roleId", {
                        setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                      })}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      disabled={rolesQuery.isLoading}
                    >
                      <option value="">
                        {t("settings.users.noRoleAssigned")}
                      </option>
                      {rolesQuery.data?.roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("settings.users.position")}
                    </label>
                    <input
                      type="text"
                      {...register("position")}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("settings.users.identificationNumber")}
                    </label>
                    <input
                      type="text"
                      {...register("identificationNumber")}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("assets.branch")}
                    </label>
                    <select
                      {...register("branchId", {
                        setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                      })}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      disabled={branchesQuery.isLoading}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue("branchId", value ? parseInt(value) : null);
                        setValue("departmentId", null);
                      }}
                    >
                      <option value="">
                        {t("settings.users.noBranchAssigned")}
                      </option>
                      {branchesQuery.data?.branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.code} - {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("assets.department")}
                    </label>
                    <select
                      {...register("departmentId", {
                        setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                      })}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      disabled={departmentsQuery.isLoading || !selectedBranchId}
                    >
                      <option value="">
                        {t("settings.users.noDepartmentAssigned")}
                      </option>
                      {availableDepartments?.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.code} - {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {t("settings.users.status")}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("settings.users.inactiveUsersNote")}
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        {...register("isActive")}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-end space-x-3 border-t pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isPending}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || (!isDirty && isEditMode)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {isPending
                        ? t("common.saving")
                        : isEditMode
                          ? t("settings.users.updateUser")
                          : t("settings.users.createUser")}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
