import { eventHandler, toWebRequest } from "vinxi/http";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./root";

export default eventHandler((event) => {
  const request = toWebRequest(event);

  if (!request) {
    return new Response("No request", { status: 400 });
  }

  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: appRouter,
    createContext() {
      // Aquí puedes inyectar sesión, base de datos, etc., en el futuro si lo necesitas
      return {};
    },
    onError({ error, path }) {
      console.error(`tRPC error on '${path}':`, error);
    },
  });
});
