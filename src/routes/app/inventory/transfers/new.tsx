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
  assets: z
    .array(
      z.object({
        assetId: z.number().min(1, "Asset is required"),
        fromLocationId: z.number().optional(),
        fromUserId: z.number().optional(),
        toLocationId: z.number().optional(),
        toUserId: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .min(1, "At least one asset must be added"),
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

  const locationsQuery = useQuery(trpc.listLocations.queryOptions({}));

  const usersQuery = useQuery(
    trpc.listUsers.queryOptions({
      activeOnly: true,
    }),
  );

  const assetsQuery = useQuery(
    trpc.listAssets.queryOptions({
      limit: 100,
    }),
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
    }),
  );

  const onSubmit = (data: TransferForm) => {
    createTransferMutation.mutate({
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
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/inventory/transfers" })}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {t("inventory.backToTransfers")}
          </button>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t("inventory.createNewTransfer")}
          </h1>
          <p className="text-gray-600">
            {t("inventory.initiateTransferMessage")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t("inventory.transferDetails")}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("inventory.processType")} *
                </label>
                <select
                  {...register("type")}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                >
                  <option value="TRANSFER">{t("inventory.transfer")}</option>
                  <option value="RECEPTION">{t("inventory.reception")}</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("inventory.defaultLocationOptional")}
                </label>
                <select
                  {...register("locationId", { valueAsNumber: true })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("inventory.notes")}
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  placeholder={t("inventory.notesPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("inventory.assetsToTransfer")}
                </h2>
                <p className="text-sm text-gray-600">
                  {t("inventory.addAssetsMessage")}
                </p>
              </div>
              <button
                type="button"
                onClick={addAssetRow}
                className="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                {t("inventory.addAsset")}
              </button>
            </div>

            {errors.assets?.root && (
              <p className="mb-4 text-sm text-red-600">
                {errors.assets.root.message}
              </p>
            )}

            {fields.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-4 text-gray-600">
                  {t("inventory.noAssetsAdded")}
                </p>
                <button
                  type="button"
                  onClick={addAssetRow}
                  className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {t("inventory.addFirstAsset")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {t("inventory.assetNumber")} {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Asset Selection */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("inventory.asset")} *
                        </label>
                        <select
                          {...register(`assets.${index}.assetId`, {
                            valueAsNumber: true,
                          })}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                        >
                          <option value={0}>
                            {t("inventory.selectAsset")}
                          </option>
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
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("inventory.fromLocation")}
                        </label>
                        <select
                          {...register(`assets.${index}.fromLocationId`, {
                            valueAsNumber: true,
                          })}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {t("inventory.notSpecified")}
                          </option>
                          {locationsQuery.data?.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Destination Location */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("inventory.toLocation")}
                        </label>
                        <select
                          {...register(`assets.${index}.toLocationId`, {
                            valueAsNumber: true,
                          })}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {t("inventory.notSpecified")}
                          </option>
                          {locationsQuery.data?.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Source User */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("inventory.fromCustodian")}
                        </label>
                        <select
                          {...register(`assets.${index}.fromUserId`, {
                            valueAsNumber: true,
                          })}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {t("inventory.notSpecified")}
                          </option>
                          {usersQuery.data?.users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Destination User */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("inventory.toCustodian")}
                        </label>
                        <select
                          {...register(`assets.${index}.toUserId`, {
                            valueAsNumber: true,
                          })}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {t("inventory.notSpecified")}
                          </option>
                          {usersQuery.data?.users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          {t("inventory.notesForAsset")}
                        </label>
                        <input
                          type="text"
                          {...register(`assets.${index}.notes`)}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500"
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
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={createTransferMutation.isPending || fields.length === 0}
              className="rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {createTransferMutation.isPending
                ? t("inventory.creating")
                : t("inventory.createTransfer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
