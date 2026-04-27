import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useState, useEffect, useRef } from "react";
import { Scan, Search, ArrowRight, MapPin, User, Package, AlertCircle } from "lucide-react";
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
    trpc.getAssetByTag.queryOptions({
      authToken: authToken || "",
      assetTag: searchTag,
    }, {
      enabled: !!searchTag && !!authToken,
      retry: false,
    })
  );

  // Handle toast notifications
  useEffect(() => {
    if (!searchTag) {
      hasShownToast.current = false;
      return;
    }

    if (lookupAssetQuery.isSuccess && lookupAssetQuery.data && !hasShownToast.current) {
      toast.success(t("inventory.assetFound"));
      hasShownToast.current = true;
    }

    if (lookupAssetQuery.isError && !hasShownToast.current) {
      toast.error(t("inventory.assetNotFound"));
      hasShownToast.current = true;
    }
  }, [lookupAssetQuery.isSuccess, lookupAssetQuery.isError, lookupAssetQuery.data, searchTag, t]);

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
            <Scan className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("inventory.scanTitle")}</h1>
          <p className="text-gray-600">
            {t("inventory.scanSubtitle")}
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder={t("inventory.searchAssets")}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!assetTag.trim() || lookupAssetQuery.isFetching}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {lookupAssetQuery.isFetching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5 mr-2" />
                    {t("inventory.scan")}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{t("inventory.scanningTips")}:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-green-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
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
                    className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Asset Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {foundAsset.name}
                      </h3>
                      <p className="text-gray-600">
                        {t("assets.assetTag")}: <span className="font-semibold">{foundAsset.assetTag}</span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        foundAsset.status
                      )}`}
                    >
                      {foundAsset.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {foundAsset.location && (
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t("assets.location")}</p>
                          <p className="font-medium">{foundAsset.location.name}</p>
                        </div>
                      </div>
                    )}

                    {foundAsset.assignedToUser && (
                      <div className="flex items-center text-gray-700">
                        <User className="w-5 h-5 mr-2 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t("assets.assignedTo")}</p>
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
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t("inventory.viewFullDetails")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!foundAsset && !lookupAssetQuery.isFetching && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("inventory.readyToScan")}
              </h3>
              <p className="text-gray-600">
                {t("inventory.enterAssetTag")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
