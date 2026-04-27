import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useState, Fragment } from "react";
import { Search, Edit, FileText, UserCircle } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/custodians/")({
  component: CustodiansPage,
});

const custodianSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().optional(),
  identificationNumber: z.string().optional(),
});

type CustodianForm = z.infer<typeof custodianSchema>;

function CustodiansPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
    identificationNumber: string | null;
  } | null>(null);

  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      authToken: authToken || "",
      activeOnly: false,
    })
  );

  const currentUserQuery = useQuery(
    trpc.getCurrentUser.queryOptions({
      authToken: authToken || "",
    })
  );

  const updateMutation = useMutation(
    trpc.updateUserCustodianDetails.mutationOptions({
      onSuccess: () => {
        toast.success(t("custodians.detailsUpdated"));
        setIsEditModalOpen(false);
        setSelectedUser(null);
        void usersQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("custodians.failedToUpdate"));
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustodianForm>({
    resolver: zodResolver(custodianSchema),
  });

  const hasAdminPermission = currentUserQuery.data?.permissions.some(
    (p) => p.name === "admin.users"
  );

  const filteredUsers = usersQuery.data?.users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.position?.toLowerCase().includes(searchLower) ||
      user.identificationNumber?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (user: typeof selectedUser) => {
    setSelectedUser(user);
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      position: user?.position || "",
      identificationNumber: user?.identificationNumber || "",
    });
    setIsEditModalOpen(true);
  };

  const onSubmit = (data: CustodianForm) => {
    if (!selectedUser) return;

    updateMutation.mutate({
      authToken: authToken || "",
      userId: selectedUser.id,
      ...data,
    });
  };

  const handleViewReport = (userId: number) => {
    void navigate({
      to: "/app/custodians/$custodianId",
      params: { custodianId: userId.toString() },
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("custodians.title")}</h1>
          <p className="text-gray-600">
            {t("custodians.subtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("custodians.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Custodians Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {usersQuery.isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("custodians.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("custodians.email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.users.position")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.users.identificationNumber")}
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserCircle className="w-8 h-8 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.position || (
                            <span className="text-gray-400 italic">Not set</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.identificationNumber || (
                            <span className="text-gray-400 italic">Not set</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isActive ? t("settings.users.activeUsers").replace(" Users", "") : t("settings.users.inactiveUsers").replace(" Users", "")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewReport(user.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title={t("custodians.printCertificate")}
                        >
                          <FileText className="w-5 h-5 inline" />
                        </button>
                        {hasAdminPermission && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-gray-600 hover:text-gray-900"
                            title={t("settings.users.editUser")}
                          >
                            <Edit className="w-5 h-5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? t("assets.noAssetsFound") : t("custodians.noCustodiansFound")}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsEditModalOpen(false)}
        >
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {t("custodians.editCustodianDetails")}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.firstName")} *
                      </label>
                      <input
                        type="text"
                        {...register("firstName")}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
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
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("settings.users.position")}
                      </label>
                      <input
                        type="text"
                        {...register("position")}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., IT Manager, Accountant"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("settings.users.identificationNumber")}
                      </label>
                      <input
                        type="text"
                        {...register("identificationNumber")}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., EMP-001"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
