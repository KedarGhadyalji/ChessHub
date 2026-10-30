// ============================================================
// authMiddleware.js
// Verifies the JWT Bearer token on every /admin/* request.
// Attaches decoded payload to req.admin on success.
// ============================================================

const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/apiResponse");

/**
 * Extract Bearer token from Authorization header.
 * @param {string} header
 * @returns {string|null}
 */
const extractToken = (header) => {
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7);
};

/**
 * Require a valid JWT. Attaches decoded payload to req.admin.
 */
const requireAuth = (req, res, next) => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return sendError(res, 401, "Authentication required.", "UNAUTHORIZED");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(
        res,
        401,
        "Session expired. Please log in again.",
        "TOKEN_EXPIRED",
      );
    }
    return sendError(res, 401, "Invalid token.", "INVALID_TOKEN");
  }
};

module.exports = { requireAuth };
