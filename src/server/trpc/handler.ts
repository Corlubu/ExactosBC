import { eventHandler, toWebRequest } from "vinxi/http";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./root";
// 1. Importamos la función real que valida el token y crea el contexto
import { createTRPCContext } from "./main";

export default eventHandler((event) => {
  const request = toWebRequest(event);

  if (!request) {
    return new Response("No request", { status: 400 });
  }

  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: appRouter,
    // 2. Inyectamos la petición real hacia nuestro validador de tRPC
    createContext: () =>
      createTRPCContext({
        req: request,
        res: undefined,
      }),
    onError({ error, path }) {
      console.error(`tRPC error on '${path}':`, error);
    },
  });
});
