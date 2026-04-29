import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
// IMPORTANTE: Importamos useQueryClient para la gestión de caché
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Users,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Shield,
  Mail,
  UserCheck,
  UserX,
} from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { UserFormModal } from "~/components/UserFormModal";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/users/")({
  component: UserManagementPage,
});

function UserManagementPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();

  // NUEVO: Instancia del cliente de caché nativo
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    position?: string | null;
    identificationNumber?: string | null;
    isActive: boolean;
    role?: { id: number; name: string } | null;
  } | null>(null);

  const [showInactive, setShowInactive] = useState(false);

  // NUEVO: Consultas nativas (Ya no requieren authToken en el input)
  const rolesQuery = useQuery(trpc.listRoles.queryOptions());

  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      // Si tu backend soporta filtrar inactivos, pásalo aquí
      // includeInactive: showInactive
    }),
  );

  // NUEVO: Mutación de borrado/desactivación actualizada
  const deleteMutation = useMutation(
    trpc.deleteUser.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.users.userDeactivated"));
        // Invalidación de caché para refrescar la lista automáticamente
        queryClient.invalidateQueries({ queryKey: [["listUsers"]] });
      },
      onError: (error) => {
        toast.error(error.message || t("settings.users.failedToDelete"));
      },
    }),
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (
      window.confirm(
        t("settings.users.deactivateConfirm").replace("{name}", userName),
      )
    ) {
      // ELIMINADO: authToken. El header global se encarga de la seguridad.
      deleteMutation.mutate({
        userId,
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    // Al cerrar con éxito el modal (crear/editar), invalidamos la caché
    queryClient.invalidateQueries({ queryKey: [["listUsers"]] });
  };

  if (usersQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800">{t("settings.users.failedToLoad")}</p>
            <button
              onClick={() => usersQuery.refetch()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtrado local basado en el estado del toggle (si el backend no lo hace)
  const users = (usersQuery.data?.users || []).filter(
    (u) => showInactive || u.isActive,
  );

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
              <div className="mr-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("settings.users.title")}
                </h1>
                <p className="mt-1 text-gray-600">
                  {t("settings.users.subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={handleAddUser}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("settings.users.addUser")}
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowInactive(false)}
              className={`rounded-lg px-4 py-2 transition-colors ${
                !showInactive
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t("settings.users.activeUsers")}
            </button>
            <button
              onClick={() => setShowInactive(true)}
              className={`rounded-lg px-4 py-2 transition-colors ${
                showInactive
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t("settings.users.allUsers")}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {users.length}{" "}
            {users.length === 1
              ? t("settings.users.user")
              : t("settings.users.users")}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {t("settings.users.noUsers")}
              </h3>
              <p className="mb-6 text-gray-600">
                {showInactive
                  ? t("settings.users.noUsersCompany")
                  : t("settings.users.noUsersActive")}
              </p>
              {!showInactive && (
                <button
                  onClick={handleAddUser}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {t("settings.users.addFirstUser")}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.users.user")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.users.email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.users.role")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.users.position")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("settings.users.status")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                            <span className="text-sm font-medium text-white">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.identificationNumber && (
                              <div className="text-sm text-gray-500">
                                ID: {user.identificationNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="mr-2 h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.role ? (
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-900">
                              {user.role.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm italic text-gray-500">
                            {t("settings.users.noRoleAssigned")}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {user.position || (
                            <span className="italic text-gray-400">
                              {t("settings.users.notSpecified")}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <UserCheck className="mr-1 h-3 w-3" />
                            {t("settings.users.active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            <UserX className="mr-1 h-3 w-3" />
                            {t("settings.users.inactive")}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-900"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user.isActive && (
                            <button
                              onClick={() =>
                                handleDeleteUser(
                                  user.id,
                                  `${user.firstName} ${user.lastName}`,
                                )
                              }
                              disabled={deleteMutation.isPending}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Deactivate user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <Shield className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-1 text-sm font-medium text-blue-900">
                {t("settings.users.aboutUserManagement")}
              </h3>
              <p className="text-sm text-blue-700">
                {t("settings.users.aboutUserManagementText")}{" "}
                <button
                  onClick={() => navigate({ to: "/app/settings/roles" })}
                  className="font-medium underline hover:text-blue-900"
                >
                  {t("settings.users.rolesPermissionsLink")}
                </button>{" "}
                {t("settings.users.section")}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        user={editingUser || undefined}
      />
    </div>
  );
}
