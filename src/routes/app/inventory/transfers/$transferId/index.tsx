import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Package,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/app/inventory/transfers/$transferId/")({
  component: TransferDetailPage,
});

function TransferDetailPage() {
  const { transferId } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();

  const transferQuery = useQuery(
    trpc.getTransferProcess.queryOptions({
      processId: parseInt(transferId),
    }),
  );

  const completeTransferMutation = useMutation(
    trpc.completeTransferProcess.mutationOptions({
      onSuccess: () => {
        toast.success(t("inventory.transferCompleted"));
        void transferQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("inventory.failedToComplete"));
      },
    }),
  );

  const cancelTransferMutation = useMutation(
    trpc.cancelTransferProcess.mutationOptions({
      onSuccess: () => {
        toast.success(t("inventory.transferCancelled"));
        void transferQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || t("inventory.failedToCancel"));
      },
    }),
  );

  const handleComplete = () => {
    if (confirm(t("inventory.confirmComplete"))) {
      completeTransferMutation.mutate({
        processId: parseInt(transferId),
      });
    }
  };

  const handleCancel = () => {
    if (confirm(t("inventory.confirmCancel"))) {
      cancelTransferMutation.mutate({
        processId: parseInt(transferId),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            <Clock className="mr-1 h-4 w-4" />
            {t("inventory.inProgress")}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <CheckCircle className="mr-1 h-4 w-4" />
            {t("inventory.completed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            <XCircle className="mr-1 h-4 w-4" />
            {t("inventory.cancelled")}
          </span>
        );
      default:
        return null;
    }
  };

  if (transferQuery.isLoading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-6xl py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">
            {t("inventory.loadingTransferDetails")}
          </p>
        </div>
      </div>
    );
  }

  if (!transferQuery.data) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-6xl py-12 text-center">
          <p className="text-red-600">{t("inventory.transferNotFound")}</p>
        </div>
      </div>
    );
  }

  const transfer = transferQuery.data;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/inventory/transfers" })}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {t("inventory.backToTransfers")}
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {transfer.type} #{transfer.id}
                </h1>
                {getStatusBadge(transfer.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {t("inventory.started")}{" "}
                  {new Date(transfer.startDate).toLocaleString()}
                </span>
                {transfer.endDate && (
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {t("inventory.ended")}{" "}
                    {new Date(transfer.endDate).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {transfer.status === "IN_PROGRESS" && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelTransferMutation.isPending}
                  className="rounded-lg border border-red-300 px-4 py-2 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {t("inventory.cancelTransfer")}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={completeTransferMutation.isPending}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {completeTransferMutation.isPending
                    ? t("inventory.completing")
                    : t("inventory.completeTransfer")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transfer Details */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("inventory.transferInformation")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {transfer.location && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("inventory.defaultLocation")}
                </label>
                <div className="flex items-center text-gray-900">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  {transfer.location.name}
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("inventory.totalAssets")}
              </label>
              <div className="flex items-center text-gray-900">
                <Package className="mr-2 h-4 w-4 text-gray-500" />
                {transfer.movements.length}{" "}
                {transfer.movements.length === 1
                  ? t("inventory.assetSingular")
                  : t("inventory.assetPlural")}
              </div>
            </div>
            {transfer.notes && (
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("inventory.notes")}
                </label>
                <div className="flex items-start text-gray-900">
                  <FileText className="mr-2 mt-0.5 h-4 w-4 text-gray-500" />
                  <span>{transfer.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Asset Movements */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("inventory.assetMovements")}
          </h2>

          {transfer.movements.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {t("inventory.noAssetsInTransfer")}
            </div>
          ) : (
            <div className="space-y-4">
              {transfer.movements.map((movement) => (
                <div
                  key={movement.id}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-300"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {movement.asset.photoUrl ? (
                        <img
                          src={movement.asset.photoUrl}
                          alt={movement.asset.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {movement.asset.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tag: {movement.asset.assetTag}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movement.asset.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Movement Details */}
                  <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-3 md:grid-cols-2">
                    {/* From */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        {t("inventory.from")}
                      </label>
                      <div className="space-y-1">
                        {movement.fromLocation && (
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            {movement.fromLocation.name}
                          </div>
                        )}
                        {movement.fromUser && (
                          <div className="flex items-center text-sm text-gray-700">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            {movement.fromUser.firstName}{" "}
                            {movement.fromUser.lastName}
                          </div>
                        )}
                        {!movement.fromLocation && !movement.fromUser && (
                          <span className="text-sm text-gray-400">
                            {t("inventory.notSpecified")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* To */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        {t("inventory.to")}
                      </label>
                      <div className="space-y-1">
                        {movement.toLocation && (
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <MapPin className="mr-2 h-4 w-4 text-green-600" />
                            {movement.toLocation.name}
                          </div>
                        )}
                        {movement.toUser && (
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <User className="mr-2 h-4 w-4 text-green-600" />
                            {movement.toUser.firstName}{" "}
                            {movement.toUser.lastName}
                          </div>
                        )}
                        {!movement.toLocation && !movement.toUser && (
                          <span className="text-sm text-gray-400">
                            {t("inventory.notSpecified")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {movement.notes && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          {t("inventory.notes")}:
                        </span>{" "}
                        {movement.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">
                    {t("inventory.movementDate")}{" "}
                    {new Date(movement.movementDate).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
