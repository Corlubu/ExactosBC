import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
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
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    position?: string | null;
    identificationNumber?: string | null;
    isActive: boolean;
    role?: { id: number; name: string } | null;
    branch?: { id: number; name: string; code: string } | null;
    department?: { id: number; name: string; code: string } | null;
  };
}

export function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const { t } = useLanguage();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const isEditMode = !!user;

  // Fetch roles for dropdown
  const rolesQuery = useQuery(
    trpc.listRoles.queryOptions({
      authToken: authToken || "",
    })
  );

  // Fetch branches for dropdown
  const branchesQuery = useQuery(
    trpc.listBranches.queryOptions({
      authToken: authToken || "",
    })
  );

  // Fetch departments for dropdown
  const departmentsQuery = useQuery(
    trpc.listDepartments.queryOptions({
      authToken: authToken || "",
    })
  );

  const createMutation = useMutation(
    trpc.createUser.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.users.userCreated"));
        onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create user");
      },
    })
  );

  const updateMutation = useMutation(
    trpc.updateUser.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.users.userUpdated"));
        onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update user");
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roleId: null,
      position: "",
      identificationNumber: "",
      isActive: true,
      branchId: null,
      departmentId: null,
    },
  });

  const selectedBranchId = watch("branchId");

  // Filter departments by selected branch
  const availableDepartments = selectedBranchId
    ? departmentsQuery.data?.departments.filter(
        (dept) => dept.branchId === selectedBranchId
      )
    : departmentsQuery.data?.departments;

  // Reset form when modal opens/closes or user changes
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
        reset({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          roleId: null,
          position: "",
          identificationNumber: "",
          isActive: true,
          branchId: null,
          departmentId: null,
        });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: UserFormData) => {
    if (isEditMode && user) {
      updateMutation.mutate({
        authToken: authToken || "",
        userId: user.id,
        email: data.email !== user.email ? data.email : undefined,
        password: data.password || undefined,
        firstName: data.firstName !== user.firstName ? data.firstName : undefined,
        lastName: data.lastName !== user.lastName ? data.lastName : undefined,
        roleId: data.roleId !== user.role?.id ? data.roleId : undefined,
        position: data.position || null,
        identificationNumber: data.identificationNumber || null,
        isActive: data.isActive !== user.isActive ? data.isActive : undefined,
        branchId: data.branchId !== user.branch?.id ? data.branchId : undefined,
        departmentId: data.departmentId !== user.department?.id ? data.departmentId : undefined,
      });
    } else {
      if (!data.password) {
        toast.error("Password is required for new users");
        return;
      }
      createMutation.mutate({
        authToken: authToken || "",
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
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                    {isEditMode ? t("settings.users.editUser") : t("settings.users.addUser")}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("auth.emailAddress")} *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("auth.password")} {!isEditMode && "*"}
                    </label>
                    <input
                      type="password"
                      {...register("password")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={isEditMode ? t("settings.users.leaveBlankPassword") : t("auth.enterPassword")}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                    {isEditMode && (
                      <p className="mt-1 text-xs text-gray-500">
                        {t("settings.users.leaveBlankPassword")}
                      </p>
                    )}
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.firstName")} *
                      </label>
                      <input
                        type="text"
                        {...register("firstName")}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.lastName")} *
                      </label>
                      <input
                        type="text"
                        {...register("lastName")}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.users.role")}
                    </label>
                    <select
                      {...register("roleId", {
                        setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={rolesQuery.isLoading}
                    >
                      <option value="">{t("settings.users.noRoleAssigned")}</option>
                      {rolesQuery.data?.roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {errors.roleId && (
                      <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.users.position")}
                    </label>
                    <input
                      type="text"
                      {...register("position")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t("settings.users.positionPlaceholder")}
                    />
                    {errors.position && (
                      <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                    )}
                  </div>

                  {/* Identification Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.users.identificationNumber")}
                    </label>
                    <input
                      type="text"
                      {...register("identificationNumber")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t("settings.users.identificationPlaceholder")}
                    />
                    {errors.identificationNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.identificationNumber.message}</p>
                    )}
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("assets.branch")}
                    </label>
                    <select
                      {...register("branchId", {
                        setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={branchesQuery.isLoading}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue("branchId", value ? parseInt(value) : null);
                        setValue("departmentId", null); // Reset department when branch changes
                      }}
                    >
                      <option value="">{t("settings.users.noBranchAssigned")}</option>
                      {branchesQuery.data?.branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.code} - {branch.name}
                        </option>
                      ))}
                    </select>
                    {errors.branchId && (
                      <p className="mt-1 text-sm text-red-600">{errors.branchId.message}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("assets.department")}
                    </label>
                    <select
                      {...register("departmentId", {
                        setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={departmentsQuery.isLoading || !selectedBranchId}
                    >
                      <option value="">{t("settings.users.noDepartmentAssigned")}</option>
                      {availableDepartments?.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.code} - {department.name}
                        </option>
                      ))}
                    </select>
                    {errors.departmentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
                    )}
                    {!selectedBranchId && (
                      <p className="mt-1 text-xs text-gray-500">
                        {t("settings.users.selectBranchFirst")}
                      </p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{t("settings.users.status")}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t("settings.users.inactiveUsersNote")}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("isActive")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isPending}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || (!isDirty && isEditMode)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isPending ? t("common.saving") : isEditMode ? t("settings.users.updateUser") : t("settings.users.createUser")}
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
