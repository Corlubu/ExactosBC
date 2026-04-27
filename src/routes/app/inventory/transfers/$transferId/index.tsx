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
      authToken: authToken || "",
      processId: parseInt(transferId),
    })
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
    })
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
    })
  );

  const handleComplete = () => {
    if (confirm(t("inventory.confirmComplete"))) {
      completeTransferMutation.mutate({
        authToken: authToken || "",
        processId: parseInt(transferId),
      });
    }
  };

  const handleCancel = () => {
    if (confirm(t("inventory.confirmCancel"))) {
      cancelTransferMutation.mutate({
        authToken: authToken || "",
        processId: parseInt(transferId),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            {t("inventory.inProgress")}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t("inventory.completed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
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
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">{t("inventory.loadingTransferDetails")}</p>
        </div>
      </div>
    );
  }

  if (!transferQuery.data) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-red-600">{t("inventory.transferNotFound")}</p>
        </div>
      </div>
    );
  }

  const transfer = transferQuery.data;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/inventory/transfers" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("inventory.backToTransfers")}
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {transfer.type} #{transfer.id}
                </h1>
                {getStatusBadge(transfer.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {t("inventory.started")} {new Date(transfer.startDate).toLocaleString()}
                </span>
                {transfer.endDate && (
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {t("inventory.ended")} {new Date(transfer.endDate).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {transfer.status === "IN_PROGRESS" && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelTransferMutation.isPending}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {t("inventory.cancelTransfer")}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={completeTransferMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {completeTransferMutation.isPending ? t("inventory.completing") : t("inventory.completeTransfer")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transfer Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("inventory.transferInformation")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transfer.location && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.defaultLocation")}
                </label>
                <div className="flex items-center text-gray-900">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {transfer.location.name}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("inventory.totalAssets")}
              </label>
              <div className="flex items-center text-gray-900">
                <Package className="w-4 h-4 mr-2 text-gray-500" />
                {transfer.movements.length} {transfer.movements.length === 1 ? t("inventory.assetSingular") : t("inventory.assetPlural")}
              </div>
            </div>
            {transfer.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.notes")}
                </label>
                <div className="flex items-start text-gray-900">
                  <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <span>{transfer.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Asset Movements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("inventory.assetMovements")}</h2>
          
          {transfer.movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t("inventory.noAssetsInTransfer")}
            </div>
          ) : (
            <div className="space-y-4">
              {transfer.movements.map((movement) => (
                <div
                  key={movement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {movement.asset.photoUrl ? (
                        <img
                          src={movement.asset.photoUrl}
                          alt={movement.asset.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{movement.asset.name}</h3>
                        <p className="text-sm text-gray-600">Tag: {movement.asset.assetTag}</p>
                        <p className="text-xs text-gray-500">{movement.asset.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Movement Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    {/* From */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t("inventory.from")}</label>
                      <div className="space-y-1">
                        {movement.fromLocation && (
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {movement.fromLocation.name}
                          </div>
                        )}
                        {movement.fromUser && (
                          <div className="flex items-center text-sm text-gray-700">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {movement.fromUser.firstName} {movement.fromUser.lastName}
                          </div>
                        )}
                        {!movement.fromLocation && !movement.fromUser && (
                          <span className="text-sm text-gray-400">{t("inventory.notSpecified")}</span>
                        )}
                      </div>
                    </div>

                    {/* To */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t("inventory.to")}</label>
                      <div className="space-y-1">
                        {movement.toLocation && (
                          <div className="flex items-center text-sm text-gray-900 font-medium">
                            <MapPin className="w-4 h-4 mr-2 text-green-600" />
                            {movement.toLocation.name}
                          </div>
                        )}
                        {movement.toUser && (
                          <div className="flex items-center text-sm text-gray-900 font-medium">
                            <User className="w-4 h-4 mr-2 text-green-600" />
                            {movement.toUser.firstName} {movement.toUser.lastName}
                          </div>
                        )}
                        {!movement.toLocation && !movement.toUser && (
                          <span className="text-sm text-gray-400">{t("inventory.notSpecified")}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {movement.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{t("inventory.notes")}:</span> {movement.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    {t("inventory.movementDate")} {new Date(movement.movementDate).toLocaleString()}
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
