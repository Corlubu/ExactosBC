import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, Shield } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional().or(z.literal("")),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
}

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: {
    id: number;
    name: string;
    description: string | null;
    permissions: Permission[];
  };
}

export function RoleFormModal({ isOpen, onClose, onSuccess, role }: RoleFormModalProps) {
  const { t } = useLanguage();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const isEditMode = !!role;

  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

  // Fetch all permissions
  const permissionsQuery = useQuery(
    trpc.listPermissions.queryOptions({
      authToken: authToken || "",
    })
  );

  const createMutation = useMutation(
    trpc.createRole.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.roles.roleCreated"));
        onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.roles.createFailed"));
      },
    })
  );

  const updateMutation = useMutation(
    trpc.updateRole.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.roles.roleUpdated"));
        onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.roles.updateFailed"));
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form and permissions when modal opens/closes or role changes
  useEffect(() => {
    if (isOpen) {
      if (role) {
        reset({
          name: role.name,
          description: role.description || "",
        });
        setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
      } else {
        reset({
          name: "",
          description: "",
        });
        setSelectedPermissions(new Set());
      }
    }
  }, [isOpen, role, reset]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryPermissions: Permission[]) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => selectedPermissions.has(id));

    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        categoryIds.forEach((id) => newSet.delete(id));
      } else {
        categoryIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const onSubmit = (data: RoleFormData) => {
    const permissionIds = Array.from(selectedPermissions);

    if (isEditMode && role) {
      updateMutation.mutate({
        authToken: authToken || "",
        roleId: role.id,
        name: data.name !== role.name ? data.name : undefined,
        description: data.description !== (role.description || "") ? (data.description || null) : undefined,
        permissionIds,
      });
    } else {
      createMutation.mutate({
        authToken: authToken || "",
        name: data.name,
        description: data.description || undefined,
        permissionIds,
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                    {isEditMode ? t("settings.roles.editRole") : t("common.create") + " " + t("settings.roles.role")}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Role Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.roles.roleName")} *
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t("settings.roles.roleNamePlaceholder")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{t("settings.roles.roleNameRequired")}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("settings.assetClasses.classDescription")}
                    </label>
                    <textarea
                      {...register("description")}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={t("settings.roles.descriptionPlaceholder")}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t("settings.roles.permissions")}
                    </label>
                    {permissionsQuery.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : permissionsQuery.data?.groupedPermissions ? (
                      <div className="border border-gray-200 rounded-lg divide-y max-h-96 overflow-y-auto">
                        {Object.entries(permissionsQuery.data.groupedPermissions).map(
                          ([category, permissions]) => {
                            const categoryPermissions = permissions as Permission[];
                            const allSelected = categoryPermissions.every((p) =>
                              selectedPermissions.has(p.id)
                            );
                            const someSelected = categoryPermissions.some((p) =>
                              selectedPermissions.has(p.id)
                            );

                            return (
                              <div key={category} className="p-4">
                                <div className="flex items-center mb-3">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => {
                                      if (el) {
                                        el.indeterminate = someSelected && !allSelected;
                                      }
                                    }}
                                    onChange={() => toggleCategory(categoryPermissions)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-3 text-sm font-semibold text-gray-900 capitalize">
                                    {category}
                                  </label>
                                </div>
                                <div className="ml-7 space-y-2">
                                  {categoryPermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-start">
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissions.has(permission.id)}
                                        onChange={() => togglePermission(permission.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                                      />
                                      <div className="ml-3 flex-1">
                                        <label className="text-sm text-gray-700">
                                          {permission.name}
                                        </label>
                                        {permission.description && (
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            {permission.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t("settings.roles.noPermissions")}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {selectedPermissions.size} {t("settings.roles.permissionsSelected")}
                    </p>
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
                      disabled={isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isPending ? t("common.saving") : isEditMode ? t("settings.roles.updateRole") : t("settings.roles.createRole")}
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
