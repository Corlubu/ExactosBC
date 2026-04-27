import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Users, ArrowLeft, Plus, Edit, Trash2, Shield, Mail, UserCheck, UserX } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { UserFormModal } from "~/components/UserFormModal";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/users/")({
  component: UserManagementPage,
});

function UserManagementPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

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

  // Fetch users
  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      authToken: authToken || "",
      activeOnly: !showInactive,
    })
  );

  // Delete mutation
  const deleteMutation = useMutation(
    trpc.deleteUser.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.users.userDeactivated"));
        void usersQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.users.failedToDelete"));
      },
    })
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: typeof editingUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (window.confirm(t("settings.users.deactivateConfirm").replace("{name}", userName))) {
      deleteMutation.mutate({
        authToken: authToken || "",
        userId,
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    void usersQuery.refetch();
  };

  if (usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{t("settings.users.failedToLoad")}</p>
            <button
              onClick={() => usersQuery.refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const users = usersQuery.data?.users || [];

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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("settings.users.title")}</h1>
                <p className="text-gray-600 mt-1">
                  {t("settings.users.subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={handleAddUser}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("settings.users.addUser")}
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowInactive(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showInactive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t("settings.users.activeUsers")}
            </button>
            <button
              onClick={() => setShowInactive(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showInactive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t("settings.users.allUsers")}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {users.length} {users.length === 1 ? t("settings.users.user") : t("settings.users.users")}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("settings.users.noUsers")}</h3>
              <p className="text-gray-600 mb-6">
                {showInactive
                  ? t("settings.users.noUsersCompany")
                  : t("settings.users.noUsersActive")}
              </p>
              {!showInactive && (
                <button
                  onClick={handleAddUser}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("settings.users.addFirstUser")}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.users.user")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.users.email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.users.role")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.users.position")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.users.status")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role ? (
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-900">{user.role.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">{t("settings.users.noRoleAssigned")}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {user.position || (
                            <span className="text-gray-400 italic">{t("settings.users.notSpecified")}</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            {t("settings.users.active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <UserX className="w-3 h-3 mr-1" />
                            {t("settings.users.inactive")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.isActive && (
                            <button
                              onClick={() =>
                                handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)
                              }
                              disabled={deleteMutation.isPending}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Deactivate user"
                            >
                              <Trash2 className="w-4 h-4" />
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                {t("settings.users.aboutUserManagement")}
              </h3>
              <p className="text-sm text-blue-700">
                {t("settings.users.aboutUserManagementText")}{" "}
                <button
                  onClick={() => navigate({ to: "/app/settings/roles" })}
                  className="underline hover:text-blue-900 font-medium"
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
