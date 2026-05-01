import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useState, useEffect, useRef } from "react";
import {
  Scan,
  Search,
  ArrowRight,
  MapPin,
  User,
  Package,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/inventory/scan/")({
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();
  const [assetTag, setAssetTag] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const hasShownToast = useRef(false);

  const lookupAssetQuery = useQuery(
    trpc.getAssetByTag.queryOptions(
      {
        assetTag: searchTag,
      },
      {
        enabled: !!searchTag && !!authToken,
        retry: false,
      },
    ),
  );

  // Handle toast notifications
  useEffect(() => {
    if (!searchTag) {
      hasShownToast.current = false;
      return;
    }

    if (
      lookupAssetQuery.isSuccess &&
      lookupAssetQuery.data &&
      !hasShownToast.current
    ) {
      toast.success(t("inventory.assetFound"));
      hasShownToast.current = true;
    }

    if (lookupAssetQuery.isError && !hasShownToast.current) {
      toast.error(t("inventory.assetNotFound"));
      hasShownToast.current = true;
    }
  }, [
    lookupAssetQuery.isSuccess,
    lookupAssetQuery.isError,
    lookupAssetQuery.data,
    searchTag,
    t,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !assetTag.trim()) return;

    hasShownToast.current = false;
    setSearchTag(assetTag.trim());
  };

  const handleViewAsset = () => {
    if (lookupAssetQuery.data) {
      navigate({
        to: "/app/assets/$assetId",
        params: { assetId: lookupAssetQuery.data.id.toString() },
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      IN_REPAIR: "bg-yellow-100 text-yellow-800",
      DISPOSED: "bg-gray-100 text-gray-800",
      STOLEN: "bg-red-100 text-red-800",
      LOST: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-blue-100 text-blue-800";
  };

  const foundAsset = lookupAssetQuery.data;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
            <Scan className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t("inventory.scanTitle")}
          </h1>
          <p className="text-gray-600">{t("inventory.scanSubtitle")}</p>
        </div>

        {/* Search Form */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder={t("inventory.searchAssets")}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-lg focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!assetTag.trim() || lookupAssetQuery.isFetching}
                className="flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {lookupAssetQuery.isFetching ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-5 w-5" />
                    {t("inventory.scan")}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start">
              <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="mb-1 font-medium">
                  {t("inventory.scanningTips")}:
                </p>
                <ul className="list-inside list-disc space-y-1 text-blue-700">
                  <li>{t("inventory.tip1")}</li>
                  <li>{t("inventory.tip2")}</li>
                  <li>{t("inventory.tip3")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Found Asset Display */}
        {foundAsset && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4">
              <h2 className="flex items-center text-lg font-semibold text-green-900">
                <Package className="mr-2 h-5 w-5" />
                {t("inventory.assetDetails")}
              </h2>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Asset Photo */}
                {foundAsset.photoUrl ? (
                  <img
                    src={foundAsset.photoUrl}
                    alt={foundAsset.name}
                    className="h-32 w-32 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Asset Info */}
                <div className="flex-1">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-2xl font-bold text-gray-900">
                        {foundAsset.name}
                      </h3>
                      <p className="text-gray-600">
                        {t("assets.assetTag")}:{" "}
                        <span className="font-semibold">
                          {foundAsset.assetTag}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                        foundAsset.status,
                      )}`}
                    >
                      {foundAsset.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    {foundAsset.location && (
                      <div className="flex items-center text-gray-700">
                        <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("assets.location")}
                          </p>
                          <p className="font-medium">
                            {foundAsset.location.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {foundAsset.assignedToUser && (
                      <div className="flex items-center text-gray-700">
                        <User className="mr-2 h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("assets.assignedTo")}
                          </p>
                          <p className="font-medium">
                            {foundAsset.assignedToUser.firstName}{" "}
                            {foundAsset.assignedToUser.lastName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleViewAsset}
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
                  >
                    {t("inventory.viewFullDetails")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!foundAsset && !lookupAssetQuery.isFetching && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t("inventory.readyToScan")}
              </h3>
              <p className="text-gray-600">{t("inventory.enterAssetTag")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
