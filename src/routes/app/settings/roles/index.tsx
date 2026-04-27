import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Shield, ArrowLeft, Plus, Edit, Trash2, Users, Key } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { RoleFormModal } from "~/components/RoleFormModal";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/roles/")({
  component: RoleManagementPage,
});

function RoleManagementPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

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

  // Fetch roles
  const rolesQuery = useQuery(
    trpc.listRoles.queryOptions({
      authToken: authToken || "",
    })
  );

  // Delete mutation
  const deleteMutation = useMutation(
    trpc.deleteRole.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.roles.roleDeletedSuccess"));
        void rolesQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.roles.roleDeletedError"));
      },
    })
  );

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: typeof editingRole) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (roleId: number, roleName: string, userCount: number) => {
    if (userCount > 0) {
      toast.error(t("settings.roles.cannotDeleteRole", { count: userCount }));
      return;
    }

    if (window.confirm(t("settings.roles.confirmDelete", { roleName }))) {
      deleteMutation.mutate({
        authToken: authToken || "",
        roleId,
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleModalSuccess = () => {
    void rolesQuery.refetch();
  };

  if (rolesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (rolesQuery.isError) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{t("settings.roles.failedToLoad")}</p>
            <button
              onClick={() => rolesQuery.refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("settings.roles.title")}</h1>
                <p className="text-gray-600 mt-1">
                  {t("settings.roles.subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateRole}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("settings.roles.createRole")}
            </button>
          </div>
        </div>

        {/* Roles Grid */}
        {roles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t("settings.roles.noRoles")}</h3>
            <p className="text-gray-600 mb-6">
              {t("settings.roles.noRolesDescription")}
            </p>
            <button
              onClick={handleCreateRole}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("settings.roles.createFirstRole")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => {
              // Group permissions by category for display
              const permissionsByCategory = role.permissions.reduce((acc, permission) => {
                if (!acc[permission.category]) {
                  acc[permission.category] = [];
                }
                acc[permission.category].push(permission);
                return acc;
              }, {} as Record<string, typeof role.permissions>);

              return (
                <div
                  key={role.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Role Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 mr-3">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {t("settings.roles.userCount", { count: role.userCount })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t("settings.roles.editRole")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id, role.name, role.userCount)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t("settings.roles.deleteRole")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-3">
                      <Key className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {t("settings.roles.permissions")} ({role.permissions.length})
                      </span>
                    </div>
                    {role.permissions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">{t("settings.roles.noPermissions")}</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                          <div key={category}>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 capitalize">
                              {category}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {permissions.map((permission) => (
                                <span
                                  key={permission.id}
                                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                  title={permission.description || undefined}
                                >
                                  {permission.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                {t("settings.roles.aboutRoles")}
              </h3>
              <p className="text-sm text-blue-700">
                {t("settings.roles.aboutRolesDescription")}{" "}
                <button
                  onClick={() => navigate({ to: "/app/settings/users" })}
                  className="underline hover:text-blue-900 font-medium"
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
