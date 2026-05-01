import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import {
  ArrowRightLeft,
  Plus,
  Package,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";
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

  const [statusFilter, setStatusFilter] = useState<
    "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ALL"
  >("ALL");
  const [typeFilter, setTypeFilter] = useState<
    "TRANSFER" | "RECEPTION" | "ALL"
  >("ALL");

  const transfersQuery = useQuery(
    trpc.listTransferProcesses.queryOptions({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      type: typeFilter === "ALL" ? undefined : typeFilter,
      limit: 50,
    }),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            {t("inventory.inProgress")}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("inventory.completed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            {t("inventory.cancelled")}
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "TRANSFER" ? (
      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
        {t("inventory.transfer")}
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
        {t("inventory.reception")}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/inventory" })}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {t("inventory.backToInventory")}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {t("inventory.transfersAndReception")}
              </h1>
              <p className="text-gray-600">{t("inventory.trackMovements")}</p>
            </div>
            <Link
              to="/app/inventory/transfers/new"
              className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("inventory.newTransfer")}
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("assets.status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
              >
                <option value="ALL">{t("inventory.allStatuses")}</option>
                <option value="IN_PROGRESS">{t("inventory.inProgress")}</option>
                <option value="COMPLETED">{t("inventory.completed")}</option>
                <option value="CANCELLED">{t("inventory.cancelled")}</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("inventory.transferType")}
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as typeof typeFilter)
                }
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
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
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">
              {t("inventory.loadingTransfers")}
            </p>
          </div>
        ) : transfersQuery.data?.processes.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <ArrowRightLeft className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {t("inventory.noTransfersFound")}
            </h3>
            <p className="mb-6 text-gray-600">
              {t("inventory.createFirstTransfer")}
            </p>
            <Link
              to="/app/inventory/transfers/new"
              className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              <Plus className="mr-2 h-5 w-5" />
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
                className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                        <ArrowRightLeft className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {process.type} #{process.id}
                        </h3>
                        {getTypeBadge(process.type)}
                        {getStatusBadge(process.status)}
                      </div>
                      {process.notes && (
                        <p className="mb-2 text-sm text-gray-600">
                          {process.notes}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(process.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Package className="mr-1 h-4 w-4" />
                          {process.assetCount}{" "}
                          {process.assetCount === 1
                            ? t("inventory.assetSingular")
                            : t("inventory.assetPlural")}
                        </span>
                        {process.location && (
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
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
                    <div className="mb-2 text-sm text-gray-600">
                      {t("inventory.movementSummary")}
                    </div>
                    <div className="space-y-2">
                      {process.movements.slice(0, 3).map((movement) => (
                        <div
                          key={movement.id}
                          className="flex items-center text-sm"
                        >
                          <span className="font-medium text-gray-900">
                            {movement.asset.assetTag}
                          </span>
                          <span className="mx-2 text-gray-400">→</span>
                          {movement.fromLocation && (
                            <span className="text-gray-600">
                              {movement.fromLocation.name}
                            </span>
                          )}
                          {movement.fromUser && (
                            <span className="text-gray-600">
                              {movement.fromUser.firstName}{" "}
                              {movement.fromUser.lastName}
                            </span>
                          )}
                          <span className="mx-2 text-gray-400">
                            {t("dashboard.employee.to")}
                          </span>
                          {movement.toLocation && (
                            <span className="font-medium text-gray-900">
                              {movement.toLocation.name}
                            </span>
                          )}
                          {movement.toUser && (
                            <span className="font-medium text-gray-900">
                              {movement.toUser.firstName}{" "}
                              {movement.toUser.lastName}
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
