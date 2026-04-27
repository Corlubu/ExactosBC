import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { ArrowRightLeft, Plus, Package, MapPin, User, Calendar, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/inventory/transfers/")({
  component: TransfersListPage,
});

function TransfersListPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();
  
  const [statusFilter, setStatusFilter] = useState<"IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<"TRANSFER" | "RECEPTION" | "ALL">("ALL");

  const transfersQuery = useQuery(
    trpc.listTransferProcesses.queryOptions({
      authToken: authToken || "",
      status: statusFilter === "ALL" ? undefined : statusFilter,
      type: typeFilter === "ALL" ? undefined : typeFilter,
      limit: 50,
    })
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            {t("inventory.inProgress")}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("inventory.completed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {t("inventory.cancelled")}
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "TRANSFER" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        {t("inventory.transfer")}
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        {t("inventory.reception")}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/inventory" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("inventory.backToInventory")}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("inventory.transfersAndReception")}</h1>
              <p className="text-gray-600">{t("inventory.trackMovements")}</p>
            </div>
            <Link
              to="/app/inventory/transfers/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("inventory.newTransfer")}
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("assets.status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">{t("inventory.allStatuses")}</option>
                <option value="IN_PROGRESS">{t("inventory.inProgress")}</option>
                <option value="COMPLETED">{t("inventory.completed")}</option>
                <option value="CANCELLED">{t("inventory.cancelled")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("inventory.transferType")}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">{t("inventory.allTypes")}</option>
                <option value="TRANSFER">{t("inventory.transfer")}</option>
                <option value="RECEPTION">{t("inventory.reception")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transfers List */}
        {transfersQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">{t("inventory.loadingTransfers")}</p>
          </div>
        ) : transfersQuery.data?.processes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("inventory.noTransfersFound")}</h3>
            <p className="text-gray-600 mb-6">
              {t("inventory.createFirstTransfer")}
            </p>
            <Link
              to="/app/inventory/transfers/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("inventory.createTransfer")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transfersQuery.data?.processes.map((process) => (
              <Link
                key={process.id}
                to="/app/inventory/transfers/$transferId"
                params={{ transferId: process.id.toString() }}
                className="block bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <ArrowRightLeft className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {process.type} #{process.id}
                        </h3>
                        {getTypeBadge(process.type)}
                        {getStatusBadge(process.status)}
                      </div>
                      {process.notes && (
                        <p className="text-sm text-gray-600 mb-2">{process.notes}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(process.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {process.assetCount} {process.assetCount === 1 ? t("inventory.assetSingular") : t("inventory.assetPlural")}
                        </span>
                        {process.location && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {process.location.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Movement Preview */}
                {process.movements.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">{t("inventory.movementSummary")}</div>
                    <div className="space-y-2">
                      {process.movements.slice(0, 3).map((movement) => (
                        <div key={movement.id} className="flex items-center text-sm">
                          <span className="font-medium text-gray-900">{movement.asset.assetTag}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          {movement.fromLocation && (
                            <span className="text-gray-600">{movement.fromLocation.name}</span>
                          )}
                          {movement.fromUser && (
                            <span className="text-gray-600">
                              {movement.fromUser.firstName} {movement.fromUser.lastName}
                            </span>
                          )}
                          <span className="mx-2 text-gray-400">{t("dashboard.employee.to")}</span>
                          {movement.toLocation && (
                            <span className="text-gray-900 font-medium">{movement.toLocation.name}</span>
                          )}
                          {movement.toUser && (
                            <span className="text-gray-900 font-medium">
                              {movement.toUser.firstName} {movement.toUser.lastName}
                            </span>
                          )}
                        </div>
                      ))}
                      {process.movements.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{process.movements.length - 3} {t("common.more")}...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
