import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { useLanguage } from "~/contexts/LanguageContext";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";

export const Route = createFileRoute("/app/inventory/transfers/new")({
  component: NewTransferPage,
});

const transferSchema = z.object({
  type: z.enum(["TRANSFER", "RECEPTION"]),
  notes: z.string().optional(),
  locationId: z.number().optional(),
  assets: z.array(
    z.object({
      assetId: z.number().min(1, "Asset is required"),
      fromLocationId: z.number().optional(),
      fromUserId: z.number().optional(),
      toLocationId: z.number().optional(),
      toUserId: z.number().optional(),
      notes: z.string().optional(),
    })
  ).min(1, "At least one asset must be added"),
});

type TransferForm = z.infer<typeof transferSchema>;

function NewTransferPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      type: "TRANSFER",
      assets: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
  });

  const transferType = watch("type");

  const locationsQuery = useQuery(
    trpc.listLocations.queryOptions({
      authToken: authToken || "",
    })
  );

  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      authToken: authToken || "",
      activeOnly: true,
    })
  );

  const assetsQuery = useQuery(
    trpc.listAssets.queryOptions({
      authToken: authToken || "",
      limit: 100,
    })
  );

  const createTransferMutation = useMutation(
    trpc.createTransferProcess.mutationOptions({
      onSuccess: (data) => {
        toast.success(t("inventory.transferCreated"));
        void navigate({
          to: "/app/inventory/transfers/$transferId",
          params: { transferId: data.id.toString() },
        });
      },
      onError: (error) => {
        toast.error(error.message || t("inventory.failedToCreate"));
      },
    })
  );

  const onSubmit = (data: TransferForm) => {
    createTransferMutation.mutate({
      authToken: authToken || "",
      ...data,
    });
  };

  const addAssetRow = () => {
    append({
      assetId: 0,
      fromLocationId: undefined,
      fromUserId: undefined,
      toLocationId: undefined,
      toUserId: undefined,
      notes: "",
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/inventory/transfers" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("inventory.backToTransfers")}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("inventory.createNewTransfer")}</h1>
          <p className="text-gray-600">{t("inventory.initiateTransferMessage")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("inventory.transferDetails")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("inventory.processType")} *
                </label>
                <select
                  {...register("type")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="TRANSFER">{t("inventory.transfer")}</option>
                  <option value="RECEPTION">{t("inventory.reception")}</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("inventory.defaultLocationOptional")}
                </label>
                <select
                  {...register("locationId", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t("inventory.selectLocation")}</option>
                  {locationsQuery.data?.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("inventory.notes")}
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t("inventory.notesPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t("inventory.assetsToTransfer")}</h2>
                <p className="text-sm text-gray-600">{t("inventory.addAssetsMessage")}</p>
              </div>
              <button
                type="button"
                onClick={addAssetRow}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t("inventory.addAsset")}
              </button>
            </div>

            {errors.assets?.root && (
              <p className="mb-4 text-sm text-red-600">{errors.assets.root.message}</p>
            )}

            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">{t("inventory.noAssetsAdded")}</p>
                <button
                  type="button"
                  onClick={addAssetRow}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("inventory.addFirstAsset")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">{t("inventory.assetNumber")} {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Asset Selection */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("inventory.asset")} *
                        </label>
                        <select
                          {...register(`assets.${index}.assetId`, { valueAsNumber: true })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value={0}>{t("inventory.selectAsset")}</option>
                          {assetsQuery.data?.assets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.assetTag} - {asset.name}
                            </option>
                          ))}
                        </select>
                        {errors.assets?.[index]?.assetId && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.assets[index]?.assetId?.message}
                          </p>
                        )}
                      </div>

                      {/* Source Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("inventory.fromLocation")}
                        </label>
                        <select
                          {...register(`assets.${index}.fromLocationId`, { valueAsNumber: true })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="">{t("inventory.notSpecified")}</option>
                          {locationsQuery.data?.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Destination Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("inventory.toLocation")}
                        </label>
                        <select
                          {...register(`assets.${index}.toLocationId`, { valueAsNumber: true })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="">{t("inventory.notSpecified")}</option>
                          {locationsQuery.data?.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Source User */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("inventory.fromCustodian")}
                        </label>
                        <select
                          {...register(`assets.${index}.fromUserId`, { valueAsNumber: true })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="">{t("inventory.notSpecified")}</option>
                          {usersQuery.data?.users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Destination User */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("inventory.toCustodian")}
                        </label>
                        <select
                          {...register(`assets.${index}.toUserId`, { valueAsNumber: true })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="">{t("inventory.notSpecified")}</option>
                          {usersQuery.data?.users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("inventory.notesForAsset")}
                        </label>
                        <input
                          type="text"
                          {...register(`assets.${index}.notes`)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                          placeholder={t("inventory.optionalNotes")}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pb-8">
            <button
              type="button"
              onClick={() => navigate({ to: "/app/inventory/transfers" })}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={createTransferMutation.isPending || fields.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {createTransferMutation.isPending ? t("inventory.creating") : t("inventory.createTransfer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
