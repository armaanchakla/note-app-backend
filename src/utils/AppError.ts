/**
 * Base application error.
 * Carries an HTTP status code and a stable error code for the API response.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(message, 404, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code = "UNAUTHORIZED", message = "Authentication required") {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(code = "FORBIDDEN", message = "Insufficient permissions") {
    super(message, 403, code);
  }
}

export class BadRequestError extends AppError {
  constructor(code = "BAD_REQUEST", message = "Bad request", details?: unknown) {
    super(message, 400, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(code = "CONFLICT", message: string) {
    super(message, 409, code);
  }
}
