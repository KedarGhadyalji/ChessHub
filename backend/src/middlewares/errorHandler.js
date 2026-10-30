// ============================================================
// errorHandler.js
// Express global error-handling middleware.
// Must be registered LAST in app.js (after all routes).
//
// Handles:
//   - Zod validation errors (ZodError)
//   - Prisma known errors (P2002 unique, P2025 not found, etc.)
//   - Generic AppError instances
//   - Unexpected errors (500)
// ============================================================

const { ZodError } = require("zod");
const { logger } = require("../utils/logger");
const { sendError } = require("../utils/apiResponse");

/**
 * Custom application error with HTTP status.
 */
class AppError extends Error {
  constructor(message, status = 500, code = "APP_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
  }
}

/**
 * Express error handler middleware.
 * Signature must have 4 params for Express to recognize it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // --- Zod validation errors ---
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return sendError(
      res,
      422,
      "Validation failed",
      "VALIDATION_ERROR",
      details,
    );
  }

  // --- Prisma errors ---
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] ?? "field";
    return sendError(
      res,
      409,
      `A record with this ${field} already exists.`,
      "CONFLICT",
    );
  }
  if (err.code === "P2025") {
    return sendError(res, 404, "Record not found.", "NOT_FOUND");
  }
  if (err.code === "P2003") {
    return sendError(
      res,
      400,
      "Invalid reference — related record does not exist.",
      "FOREIGN_KEY_ERROR",
    );
  }

  // --- Operational app errors ---
  if (err.isOperational) {
    return sendError(res, err.status, err.message, err.code);
  }

  // --- Unknown / unexpected errors ---
  logger.error("Unexpected error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  return sendError(
    res,
    500,
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred."
      : err.message,
    "INTERNAL_ERROR",
  );
};

module.exports = { errorHandler, AppError };
