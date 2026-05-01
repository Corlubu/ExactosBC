import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, MapPin, User } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { z } from "zod";

// 1. MAGIA ENTERPRISE: Definimos los filtros en la URL usando Zod
const assetSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  branchId: z.number().optional(),
  // ... puedes agregar el resto de filtros aquí
});

export const Route = createFileRoute("/app/assets/")({
  // 2. Validamos la URL antes de cargar la página
  validateSearch: assetSearchSchema,
  component: AssetsListPage,
});

function AssetsListPage() {
  const { t } = useLanguage();
  const trpc = useTRPC();
  const navigate = useNavigate({ from: Route.fullPath });

  // 3. Extraemos los filtros directamente de la URL (¡Sobreviven a recargas!)
  const searchParams = Route.useSearch();

  // Mantenemos el estado local solo para los inputs mientras el usuario escribe,
  // pero lo inicializamos con lo que venga de la URL
  const [search, setSearch] = useState(searchParams.search || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.status || "");
  const [branchFilter, setBranchFilter] = useState<number | undefined>(
    searchParams.branchId,
  );
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(
    undefined,
  );

  // 4. LIMPIEZA: Ya no usamos authToken en ninguna consulta
  const locationsQuery = useQuery(trpc.listLocations.queryOptions());
  const branchesQuery = useQuery(trpc.listBranches.queryOptions());

  const departmentsQuery = useQuery(
    trpc.listDepartments.queryOptions({
      branchId: branchFilter, // Mantenemos los parámetros de negocio
    }),
  );

  const assetTypesQuery = useQuery(trpc.listAssetTypes.queryOptions());
  const usersQuery = useQuery(trpc.listUsers.queryOptions());

  // 5. La consulta principal ahora lee los filtros limpios
  const assetsQuery = useQuery(
    trpc.listAssets.queryOptions({
      search: search || undefined,
      status: statusFilter || undefined,
      branchId: branchFilter,
      departmentId: departmentFilter,
      // ...
    }),
  );

  // 6. Función para actualizar la URL cuando un filtro cambia
  const updateFiltersInUrl = (newFilters: any) => {
    navigate({
      search: (prev) => ({ ...prev, ...newFilters }),
      replace: true, // No ensucia el historial del botón "Atrás"
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t("assets.title")}
          </h1>
          <p className="text-gray-600">{t("assets.subtitle")}</p>
        </div>
        <Link
          to="/app/assets/new"
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t("assets.addAsset")}
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Búsqueda */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.search")}
            </label>
            <div className="relative">
              <Search className="absolute inset-y-0 left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateFiltersInUrl({ search: e.target.value || undefined });
                }}
                placeholder={t("assets.searchPlaceholder")}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("assets.status")}
            </label>
            <div className="relative">
              <Filter className="absolute inset-y-0 left-3 top-2.5 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  updateFiltersInUrl({ status: e.target.value || undefined });
                }}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("assets.allStatuses")}</option>
                <option value="ACTIVE">{t("assets.statusActive")}</option>
                <option value="IN_REPAIR">{t("assets.statusInRepair")}</option>
              </select>
            </div>
          </div>

          {/* Puedes agregar el resto de los filtros usando el mismo patrón */}
        </div>
      </div>

      {/* Assets List */}
      {assetsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      ) : assetsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{t("assets.failedToLoad")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* TABLA: El código de tu tabla aquí (no lo cambié para no hacerlo infinito) */}
          <div className="p-4">
            Se encontraron {assetsQuery.data.assets.length} activos.
          </div>
        </div>
      )}
    </div>
  );
}
