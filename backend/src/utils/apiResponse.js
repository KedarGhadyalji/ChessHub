// ============================================================
// apiResponse.js
// Enforces a consistent JSON shape for every API response.
//
// Success:  { success: true,  data: {...},  meta: {...} }
// Error:    { success: false, error: { code, message, details } }
// ============================================================

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*}      data    - Payload to send
 * @param {object} [meta] - Optional pagination / extra info
 * @param {number} [status=200]
 */
const sendSuccess = (res, data, meta = null, status = 200) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

/**
 * Send a created (201) response.
 */
const sendCreated = (res, data) => sendSuccess(res, data, null, 201);

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number} status      - HTTP status code
 * @param {string} message     - Human-readable message
 * @param {string} [code]      - Machine-readable error code
 * @param {*}      [details]   - Validation errors or extra context
 */
const sendError = (res, status, message, code = "ERROR", details = null) => {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return res.status(status).json(body);
};

/**
 * Build pagination meta from Prisma count + query params.
 */
const buildMeta = (total, page, limit) => ({
  total,
  page: Number(page),
  limit: Number(limit),
  totalPages: Math.ceil(total / limit),
});

module.exports = { sendSuccess, sendCreated, sendError, buildMeta };
