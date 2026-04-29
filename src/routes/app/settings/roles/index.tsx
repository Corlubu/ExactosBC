import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
// IMPORTANTE: Agregamos useQueryClient de TanStack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Shield,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Users,
  Key,
} from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { RoleFormModal } from "~/components/RoleFormModal";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/roles/")({
  component: RoleManagementPage,
});

function RoleManagementPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();

  // NUEVO: Inicializamos el cliente de caché nativo
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{
    id: number;
    name: string;
    description: string | null;
    permissions: Array<{
      id: number;
      name: string;
      description: string | null;
      category: string;
    }>;
  } | null>(null);

  // NUEVO: Fetch roles usando la sintaxis nativa de TanStack Query
  const rolesQuery = useQuery(trpc.listRoles.queryOptions());

  // NUEVO: Delete mutation actualizado
  const deleteMutation = useMutation(
    trpc.deleteRole.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.roles.roleDeletedSuccess"));
        // Invalidar caché en lugar de refetch directo para mantener consistencia
        queryClient.invalidateQueries({ queryKey: [["listRoles"]] });
      },
      onError: (error) => {
        toast.error(error.message || t("settings.roles.roleDeletedError"));
      },
    }),
  );

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: typeof editingRole) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (
    roleId: number,
    roleName: string,
    userCount: number,
  ) => {
    if (userCount > 0) {
      toast.error(t("settings.roles.cannotDeleteRole", { count: userCount }));
      return;
    }

    if (window.confirm(t("settings.roles.confirmDelete", { roleName }))) {
      // ELIMINADO: authToken. Ya solo pasamos el roleId.
      deleteMutation.mutate({
        roleId,
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleModalSuccess = () => {
    // Invalidar caché de roles cuando el modal termina con éxito (crear/editar)
    queryClient.invalidateQueries({ queryKey: [["listRoles"]] });
  };

  if (rolesQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (rolesQuery.isError) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800">{t("settings.roles.failedToLoad")}</p>
            <button
              onClick={() => rolesQuery.refetch()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roles = rolesQuery.data?.roles || [];

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
            <div className="flex items-center">
              <div className="mr-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("settings.roles.title")}
                </h1>
                <p className="mt-1 text-gray-600">
                  {t("settings.roles.subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateRole}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("settings.roles.createRole")}
            </button>
          </div>
        </div>

        {/* Roles Grid */}
        {roles.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {t("settings.roles.noRoles")}
            </h3>
            <p className="mb-6 text-gray-600">
              {t("settings.roles.noRolesDescription")}
            </p>
            <button
              onClick={handleCreateRole}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("settings.roles.createFirstRole")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {roles.map((role) => {
              // Group permissions by category for display
              const permissionsByCategory = role.permissions.reduce(
                (acc, permission) => {
                  if (!acc[permission.category]) {
                    acc[permission.category] = [];
                  }
                  acc[permission.category].push(permission);
                  return acc;
                },
                {} as Record<string, typeof role.permissions>,
              );

              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Role Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center">
                        <div className="mr-3 inline-flex rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-2">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {role.name}
                        </h3>
                      </div>
                      {role.description && (
                        <p className="mb-3 text-sm text-gray-600">
                          {role.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="mr-1 h-4 w-4" />
                        {t("settings.roles.userCount", {
                          count: role.userCount,
                        })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-900"
                        title={t("settings.roles.editRole")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRole(role.id, role.name, role.userCount)
                        }
                        disabled={deleteMutation.isPending}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                        title={t("settings.roles.deleteRole")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-3 flex items-center">
                      <Key className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {t("settings.roles.permissions")} (
                        {role.permissions.length})
                      </span>
                    </div>
                    {role.permissions.length === 0 ? (
                      <p className="text-sm italic text-gray-500">
                        {t("settings.roles.noPermissions")}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(permissionsByCategory).map(
                          ([category, permissions]) => (
                            <div key={category}>
                              <h4 className="mb-2 text-xs font-semibold uppercase capitalize tracking-wider text-gray-500">
                                {category}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {permissions.map((permission) => (
                                  <span
                                    key={permission.id}
                                    className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                                    title={permission.description || undefined}
                                  >
                                    {permission.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <Shield className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-1 text-sm font-medium text-blue-900">
                {t("settings.roles.aboutRoles")}
              </h3>
              <p className="text-sm text-blue-700">
                {t("settings.roles.aboutRolesDescription")}{" "}
                <button
                  onClick={() => navigate({ to: "/app/settings/users" })}
                  className="font-medium underline hover:text-blue-900"
                >
                  {t("settings.users.title")}
                </button>{" "}
                {t("settings.roles.aboutRolesDescription2")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Form Modal */}
      <RoleFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        role={editingRole || undefined}
      />
    </div>
  );
}
