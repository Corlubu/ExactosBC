import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  X,
  PlayCircle,
} from "lucide-react";
import { useState, Fragment } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/alerts/")({
  component: AlertsSettingsPage,
});

const alertFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  alertType: z.enum([
    "DEPRECIATION_MILESTONE",
    "BOOK_VALUE_THRESHOLD",
    "FULLY_DEPRECIATED",
  ]),
  thresholdPercentage: z.number().min(0).max(100).optional(),
  thresholdAmount: z.number().min(0).optional(),
  assetCategory: z.string().optional(),
  isEnabled: z.boolean().default(true),
  notifyUsers: z.boolean().default(true),
});

type AlertFormData = z.infer<typeof alertFormSchema>;

function AlertsSettingsPage() {
  const { t } = useLanguage();
  const authToken = useAuthStore((state) => state.authToken);
  const trpc = useTRPC();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "active-alerts">(
    "settings",
  );

  // Fetch alert settings
  const alertSettingsQuery = useQuery(trpc.listAlertSettings.queryOptions({}));

  // Fetch active alerts
  const activeAlertsQuery = useQuery(
    trpc.listAssetAlerts.queryOptions({
      status: "ACTIVE",
    }),
  );

  // Mutations
  const createMutation = useMutation(
    trpc.createAlertSetting.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.alerts.ruleCreated"));
        setIsCreateModalOpen(false);
        void alertSettingsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.alerts.failedToCreate"));
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.updateAlertSetting.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.alerts.ruleUpdated"));
        setEditingAlert(null);
        void alertSettingsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.alerts.failedToUpdate"));
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.deleteAlertSetting.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.alerts.ruleDeleted"));
        void alertSettingsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.alerts.failedToDelete"));
      },
    }),
  );

  const checkAlertsMutation = useMutation(
    trpc.checkDepreciationAlerts.mutationOptions({
      onSuccess: (data) => {
        if (data.triggeredAlerts.length > 0) {
          toast.success(
            `${data.triggeredAlerts.length} ${t("settings.alerts.alertTriggered")}`,
          );
        } else {
          toast.success(t("settings.alerts.noNewAlerts"));
        }
        void activeAlertsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.alerts.failedToCheck"));
      },
    }),
  );

  const markAlertMutation = useMutation(
    trpc.markAlertAsRead.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.alerts.alertAcknowledged"));
        void activeAlertsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("settings.alerts.failedToAcknowledge"));
      },
    }),
  );

  const handleCheckAlerts = () => {
    checkAlertsMutation.mutate({});
  };

  const handleDeleteAlert = (id: number) => {
    if (confirm(t("settings.alerts.deleteConfirm"))) {
      deleteMutation.mutate({
        id,
      });
    }
  };

  const handleToggleEnabled = (id: number, currentValue: boolean) => {
    updateMutation.mutate({
      id,
      isEnabled: !currentValue,
    });
  };

  const handleAcknowledgeAlert = (alertId: number) => {
    markAlertMutation.mutate({
      alertId,
      status: "ACKNOWLEDGED",
    });
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "DEPRECIATION_MILESTONE":
        return <TrendingDown className="h-5 w-5" />;
      case "BOOK_VALUE_THRESHOLD":
        return <AlertTriangle className="h-5 w-5" />;
      case "FULLY_DEPRECIATED":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertTypeName = (type: string) => {
    switch (type) {
      case "DEPRECIATION_MILESTONE":
        return t("settings.alerts.depreciationMilestone");
      case "BOOK_VALUE_THRESHOLD":
        return t("settings.alerts.bookValueThreshold");
      case "FULLY_DEPRECIATED":
        return t("settings.alerts.fullyDepreciated");
      default:
        return type;
    }
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("settings.alerts.title")}
              </h1>
              <p className="mt-2 text-gray-600">
                {t("settings.alerts.subtitle")}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCheckAlerts}
                disabled={checkAlertsMutation.isPending}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {checkAlertsMutation.isPending
                  ? t("settings.alerts.checking")
                  : t("settings.alerts.checkNow")}
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("settings.alerts.newAlertRule")}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("settings")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {t("settings.alerts.alertRules")}
            </button>
            <button
              onClick={() => setActiveTab("active-alerts")}
              className={`flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "active-alerts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {t("settings.alerts.activeAlerts")}
              {activeAlertsQuery.data &&
                activeAlertsQuery.data.activeCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {activeAlertsQuery.data.activeCount}
                  </span>
                )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === "settings" ? (
          <AlertSettingsTab
            alertSettings={alertSettingsQuery.data || []}
            isLoading={alertSettingsQuery.isLoading}
            onEdit={setEditingAlert}
            onDelete={handleDeleteAlert}
            onToggleEnabled={handleToggleEnabled}
            getAlertTypeIcon={getAlertTypeIcon}
            getAlertTypeName={getAlertTypeName}
          />
        ) : (
          <ActiveAlertsTab
            alerts={activeAlertsQuery.data?.alerts || []}
            isLoading={activeAlertsQuery.isLoading}
            onAcknowledge={handleAcknowledgeAlert}
            getAlertTypeIcon={getAlertTypeIcon}
            getAlertTypeName={getAlertTypeName}
          />
        )}

        {/* Create/Edit Modal */}
        <AlertFormModal
          isOpen={isCreateModalOpen || editingAlert !== null}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingAlert(null);
          }}
          editingId={editingAlert}
          alertSettings={alertSettingsQuery.data || []}
          onSubmit={(data) => {
            if (editingAlert) {
              updateMutation.mutate({
                id: editingAlert,
                ...data,
              });
            } else {
              createMutation.mutate({
                ...data,
              });
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}

function AlertSettingsTab({
  alertSettings,
  isLoading,
  onEdit,
  onDelete,
  onToggleEnabled,
  getAlertTypeIcon,
  getAlertTypeName,
}: {
  alertSettings: Array<{
    id: number;
    name: string;
    alertType: string;
    isEnabled: boolean;
    thresholdPercentage: number | null;
    thresholdAmount: number | null;
    assetCategory: string | null;
  }>;
  isLoading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleEnabled: (id: number, currentValue: boolean) => void;
  getAlertTypeIcon: (type: string) => React.ReactNode;
  getAlertTypeName: (type: string) => string;
}) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (alertSettings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
        <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          {t("settings.alerts.noRulesConfigured")}
        </h3>
        <p className="mb-6 text-gray-500">
          {t("settings.alerts.createFirstRule")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("settings.alerts.alertRules")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("settings.alerts.type")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("settings.alerts.threshold")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("settings.alerts.category")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("common.status")}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("common.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {alertSettings.map((setting) => (
            <tr key={setting.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {setting.name}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center text-sm text-gray-600">
                  {getAlertTypeIcon(setting.alertType)}
                  <span className="ml-2">
                    {getAlertTypeName(setting.alertType)}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {setting.thresholdPercentage !== null
                  ? `${setting.thresholdPercentage}%`
                  : setting.thresholdAmount !== null
                    ? `$${setting.thresholdAmount.toFixed(2)}`
                    : "N/A"}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {setting.assetCategory || t("settings.alerts.allCategories")}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <Switch
                  checked={setting.isEnabled}
                  onChange={() =>
                    onToggleEnabled(setting.id, setting.isEnabled)
                  }
                  className={`${
                    setting.isEnabled ? "bg-blue-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      setting.isEnabled ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(setting.id)}
                  className="mr-4 text-blue-600 hover:text-blue-900"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(setting.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActiveAlertsTab({
  alerts,
  isLoading,
  onAcknowledge,
  getAlertTypeIcon,
  getAlertTypeName,
}: {
  alerts: Array<{
    id: number;
    message: string;
    alertType: string;
    currentValue: number;
    thresholdValue: number | null;
    triggeredAt: Date;
    asset: {
      id: number;
      name: string;
      assetTag: string;
      category: string;
    };
  }>;
  isLoading: boolean;
  onAcknowledge: (alertId: number) => void;
  getAlertTypeIcon: (type: string) => React.ReactNode;
  getAlertTypeName: (type: string) => string;
}) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          {t("settings.alerts.noActiveAlerts")}
        </h3>
        <p className="text-gray-500">
          {t("settings.alerts.allWithinThresholds")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="rounded-lg border border-orange-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center">
                <div className="mr-3 flex items-center text-orange-600">
                  {getAlertTypeIcon(alert.alertType)}
                </div>
                <span className="rounded bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
                  {getAlertTypeName(alert.alertType)}
                </span>
                <span className="ml-3 text-xs text-gray-500">
                  {new Date(alert.triggeredAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mb-2 font-medium text-gray-900">{alert.message}</p>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2 font-medium">
                  {t("settings.alerts.asset")}:
                </span>
                <span>
                  {alert.asset.name} ({alert.asset.assetTag})
                </span>
                <span className="mx-2">•</span>
                <span>{alert.asset.category}</span>
              </div>
            </div>
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="ml-4 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("common.acknowledge")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertFormModal({
  isOpen,
  onClose,
  editingId,
  alertSettings,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingId: number | null;
  alertSettings: Array<{
    id: number;
    name: string;
    alertType: string;
    isEnabled: boolean;
    thresholdPercentage: number | null;
    thresholdAmount: number | null;
    assetCategory: string | null;
    notifyUsers: boolean;
  }>;
  onSubmit: (data: AlertFormData) => void;
  isSubmitting: boolean;
}) {
  const { t } = useLanguage();
  const editingAlert = editingId
    ? alertSettings.find((a) => a.id === editingId)
    : null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: editingAlert
      ? {
          name: editingAlert.name,
          alertType: editingAlert.alertType as AlertFormData["alertType"],
          thresholdPercentage: editingAlert.thresholdPercentage || undefined,
          thresholdAmount: editingAlert.thresholdAmount || undefined,
          assetCategory: editingAlert.assetCategory || undefined,
          isEnabled: editingAlert.isEnabled,
          notifyUsers: editingAlert.notifyUsers,
        }
      : {
          alertType: "DEPRECIATION_MILESTONE",
          isEnabled: true,
          notifyUsers: true,
        },
  });

  const alertType = watch("alertType");

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {editingId
                      ? t("settings.alerts.editRule")
                      : t("settings.alerts.newAlertRule")}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("settings.alerts.ruleName")}
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("settings.alerts.ruleNamePlaceholder")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {t("settings.alerts.ruleNameRequired")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("settings.alerts.alertType")}
                    </label>
                    <select
                      {...register("alertType")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DEPRECIATION_MILESTONE">
                        {t("settings.alerts.depreciationMilestone")}
                      </option>
                      <option value="BOOK_VALUE_THRESHOLD">
                        {t("settings.alerts.bookValueThreshold")}
                      </option>
                      <option value="FULLY_DEPRECIATED">
                        {t("settings.alerts.fullyDepreciated")}
                      </option>
                    </select>
                    {errors.alertType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.alertType.message}
                      </p>
                    )}
                  </div>

                  {alertType === "DEPRECIATION_MILESTONE" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t("settings.alerts.depreciationPercentageThreshold")}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          {...register("thresholdPercentage", {
                            valueAsNumber: true,
                          })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="75"
                        />
                        <span className="absolute right-3 top-2 text-gray-500">
                          %
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {t("settings.alerts.depreciationPercentageHelper")}
                      </p>
                      {errors.thresholdPercentage && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.thresholdPercentage.message}
                        </p>
                      )}
                    </div>
                  )}

                  {alertType === "BOOK_VALUE_THRESHOLD" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t("settings.alerts.bookValueThresholdAmount")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          {...register("thresholdAmount", {
                            valueAsNumber: true,
                          })}
                          className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1000.00"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {t("settings.alerts.bookValueThresholdHelper")}
                      </p>
                      {errors.thresholdAmount && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.thresholdAmount.message}
                        </p>
                      )}
                    </div>
                  )}

                  {alertType === "FULLY_DEPRECIATED" && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        {t("settings.alerts.fullyDepreciatedHelper")}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("settings.alerts.assetCategory")} (
                      {t("common.optional")})
                    </label>
                    <input
                      type="text"
                      {...register("assetCategory")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t(
                        "settings.alerts.assetCategoryPlaceholder",
                      )}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t("settings.alerts.assetCategoryHelper")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register("isEnabled")}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {t("settings.alerts.enableAlert")}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register("notifyUsers")}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {t("settings.alerts.notifyUsers")}
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? t("common.saving")
                        : editingId
                          ? t("settings.alerts.update")
                          : t("settings.alerts.create")}
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
