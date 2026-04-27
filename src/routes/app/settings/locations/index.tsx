import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { ArrowLeft, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/app/settings/locations/")({
  component: LocationsPage,
});

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  type: z.string().min(1, "Location type is required"),
  address: z.string().optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  parentId: z.coerce.number().optional().nullable(),
  branchId: z.coerce.number().optional().nullable(),
  departmentId: z.coerce.number().optional().nullable(),
});

type LocationForm = z.infer<typeof locationSchema>;

function LocationsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [editingLocation, setEditingLocation] = useState<{
    id: number;
    name: string;
    type: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    parentId: number | null;
    branchId: number | null;
    departmentId: number | null;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const locationsQuery = useQuery(
    trpc.listLocations.queryOptions({
      authToken: authToken || "",
    })
  );

  const branchesQuery = useQuery(
    trpc.listBranches.queryOptions({
      authToken: authToken || "",
    })
  );

  const departmentsQuery = useQuery(
    trpc.listDepartments.queryOptions({
      authToken: authToken || "",
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
  });

  const selectedBranchId = watch("branchId");

  const createLocationMutation = useMutation(
    trpc.createLocation.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.locations.locationCreated"));
        void locationsQuery.refetch();
        reset();
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create location");
      },
    })
  );

  const updateLocationMutation = useMutation(
    trpc.updateLocation.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.locations.locationUpdated"));
        void locationsQuery.refetch();
        reset();
        setEditingLocation(null);
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update location");
      },
    })
  );

  const deleteLocationMutation = useMutation(
    trpc.deleteLocation.mutationOptions({
      onSuccess: () => {
        toast.success(t("settings.locations.locationDeleted"));
        void locationsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete location");
      },
    })
  );

  const onSubmit = (data: LocationForm) => {
    const payload = {
      authToken: authToken || "",
      name: data.name,
      type: data.type,
      address: data.address || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      parentId: data.parentId || undefined,
      branchId: data.branchId || undefined,
      departmentId: data.departmentId || undefined,
    };

    if (editingLocation) {
      updateLocationMutation.mutate({
        ...payload,
        id: editingLocation.id,
      });
    } else {
      createLocationMutation.mutate(payload);
    }
  };

  const handleEdit = (location: {
    id: number;
    name: string;
    type: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    parentId: number | null;
    branchId: number | null;
    departmentId: number | null;
  }) => {
    setEditingLocation(location);
    reset({
      name: location.name,
      type: location.type,
      address: location.address || "",
      latitude: location.latitude,
      longitude: location.longitude,
      parentId: location.parentId,
      branchId: location.branchId,
      departmentId: location.departmentId,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (locationId: number) => {
    if (
      confirm(
        t("settings.locations.deleteConfirm")
      )
    ) {
      deleteLocationMutation.mutate({
        authToken: authToken || "",
        id: locationId,
      });
    }
  };

  const handleCancel = () => {
    setEditingLocation(null);
    reset();
    setIsFormOpen(false);
  };

  // Filter out the current location from parent options when editing
  const availableParentLocations = editingLocation
    ? locationsQuery.data?.locations.filter((loc) => loc.id !== editingLocation.id)
    : locationsQuery.data?.locations;

  // Filter departments by selected branch
  const availableDepartments = selectedBranchId
    ? departmentsQuery.data?.departments.filter(
        (dept) => dept.branchId === selectedBranchId
      )
    : departmentsQuery.data?.departments;

  const locationTypes = [
    "WAREHOUSE",
    "OFFICE",
    "BUILDING",
    "ROOM",
    "FLOOR",
    "DEPARTMENT",
    "STORAGE",
    "FACILITY",
    "OTHER",
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: "/app/settings" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("settings.backToSettings")}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("settings.locations.title")}
              </h1>
              <p className="text-gray-600">
                {t("settings.locations.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("settings.locations.addLocation")}
            </button>
          </div>
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLocation ? t("settings.locations.editLocation") : t("settings.locations.newLocation")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.locations.locationName")} *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.locations.locationNamePlaceholder")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("settings.locations.locationNameRequired")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.locations.locationType")} *
                  </label>
                  <select
                    {...register("type")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t("settings.locations.selectType")}</option>
                    {locationTypes.map((type) => (
                      <option key={type} value={type}>
                        {t(`locationTypes.${type}`)}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("settings.locations.locationTypeRequired")}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.locations.address")}
                  </label>
                  <input
                    type="text"
                    {...register("address")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.locations.addressPlaceholder")}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("assets.branch")}
                    <span className="text-xs text-gray-500 ml-2">
                      ({t("common.optional")} - link to organizational structure)
                    </span>
                  </label>
                  <select
                    {...register("branchId")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const value = e.target.value;
                      setValue("branchId", value ? parseInt(value) : null);
                      setValue("departmentId", null); // Reset department when branch changes
                    }}
                  >
                    <option value="">{t("common.none")}</option>
                    {branchesQuery.data?.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.code} - {branch.name}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.branchId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("assets.department")}
                    <span className="text-xs text-gray-500 ml-2">
                      ({t("common.optional")} - must select branch first)
                    </span>
                  </label>
                  <select
                    {...register("departmentId")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!selectedBranchId}
                  >
                    <option value="">{t("common.none")}</option>
                    {availableDepartments?.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.code} - {department.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.departmentId.message}
                    </p>
                  )}
                  {!selectedBranchId && (
                    <p className="mt-1 text-xs text-gray-500">
                      {t("settings.users.selectBranchFirst")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("latitude")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 40.7128"
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("longitude")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., -74.0060"
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Location
                    <span className="text-xs text-gray-500 ml-2">
                      ({t("common.optional")} - for hierarchical organization)
                    </span>
                  </label>
                  <select
                    {...register("parentId")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t("common.none")}</option>
                    {availableParentLocations?.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.type})
                      </option>
                    ))}
                  </select>
                  {errors.parentId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.parentId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    createLocationMutation.isPending ||
                    updateLocationMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingLocation ? t("common.update") : t("common.create")} {t("settings.locations.title")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {locationsQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">
              {t("common.loading")}
            </div>
          ) : locationsQuery.data?.locations.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t("settings.locations.noLocations")}</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("settings.branches.createFirst")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.departments.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.alerts.type")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("settings.locations.address")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locationsQuery.data?.locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {location.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t(`locationTypes.${location.type}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {location.address || (
                          <span className="text-gray-400 italic">
                            {t("settings.branches.noAddress")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.latitude && location.longitude ? (
                          <span className="font-mono text-xs">
                            {location.latitude.toFixed(4)},{" "}
                            {location.longitude.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
