// ============================================================
// validate.js
// Factory that returns an Express middleware which validates
// req.body (or req.query) against a Zod schema.
// On failure, throws ZodError — caught by errorHandler.
// ============================================================

/**
 * Validate request body against a Zod schema.
 * @param {import('zod').ZodTypeAny} schema
 */
const validateBody = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body); // throws ZodError on failure
  next();
};

/**
 * Validate req.query against a Zod schema.
 * @param {import('zod').ZodTypeAny} schema
 */
const validateQuery = (schema) => (req, res, next) => {
  req.query = schema.parse(req.query);
  next();
};

module.exports = { validateBody, validateQuery };
