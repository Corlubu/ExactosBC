// src/server/domain/errors.ts

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, identifier?: string | number) {
    super(`${entity} no encontrado${identifier ? `: ${identifier}` : ""}`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(
    message: string = "No tienes permisos para realizar esta acción",
  ) {
    super(message);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
