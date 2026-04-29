//src/server/trpc/error-mapper.ts

import { TRPCError } from "@trpc/server";
import {
  DomainError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "../domain/errors";

export function handleTrpcError(error: unknown): never {
  if (error instanceof TRPCError) {
    throw error; // Si ya es un error de tRPC, lo dejamos pasar
  }

  if (error instanceof NotFoundError) {
    throw new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof ValidationError) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  if (error instanceof UnauthorizedError) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: error.message });
  }

  if (error instanceof ConflictError) {
    throw new TRPCError({ code: "CONFLICT", message: error.message });
  }

  if (error instanceof DomainError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }

  // Error inesperado (Base de datos caída, etc.)
  console.error("Uncaught Error:", error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Ha ocurrido un error interno en el servidor.",
  });
}
