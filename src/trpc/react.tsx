import { QueryClientProvider } from "@tanstack/react-query";
import {
  loggerLink,
  splitLink,
  httpBatchStreamLink,
  httpSubscriptionLink,
  createTRPCClient,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import SuperJSON from "superjson";

import { AppRouter } from "~/server/trpc/root";
import { getQueryClient } from "./query-client";
// 1. Importamos el store de Zustand
import { useAuthStore } from "~/stores/auth";

const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

export { useTRPC, useTRPCClient };

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return `http://localhost:3000`;
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        splitLink({
          condition: (op) => op.type === "subscription",
          false: httpBatchStreamLink({
            transformer: SuperJSON,
            url: getBaseUrl() + "/trpc",
            // 2. Inyectamos el Token en los Headers globales
            headers: () => {
              let token = useAuthStore.getState().authToken;

              // Si Zustand aún no carga (por los milisegundos al recargar la página),
              // lo extraemos directamente y de forma síncrona del LocalStorage.
              if (!token && typeof window !== "undefined") {
                try {
                  const stored = localStorage.getItem("assetmaster-auth");
                  if (stored) {
                    token = JSON.parse(stored).state.authToken;
                  }
                } catch (e) {
                  // Ignoramos errores de parseo
                }
              }
              return {
                Authorization: token ? `Bearer ${token}` : undefined,
              };
            },
          }),
          true: httpSubscriptionLink({
            transformer: SuperJSON,
            url: `${getBaseUrl()}/trpc`,
          }),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
