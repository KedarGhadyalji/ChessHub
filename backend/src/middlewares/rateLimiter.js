// ============================================================
// rateLimiter.js
// Configures express-rate-limit for different route groups.
//
// Limits (deliberately generous for admin-heavy workflows):
//   apiLimiter:    1000 req / 15 min  (general browsing + admin)
//   authLimiter:   20   req / 15 min  (login — brute-force guard)
//   searchLimiter: 120  req / 1 min   (search — debounced client-side)
//
// The general apiLimiter is intentionally high because a single
// admin page load can trigger 5-10 parallel API calls, and
// navigating between pages quickly adds up fast.
// Auth and search have tighter limits because they're more
// abuse-prone (credential stuffing, scraping).
// ============================================================

const rateLimit = require("express-rate-limit");
const { sendError } = require("../utils/apiResponse");

const handler = (req, res) =>
  sendError(res, 429, "Too many requests. Please slow down.", "RATE_LIMITED");

/**
 * General API limiter — covers all /api/* routes.
 * 1000 requests per 15 minutes per IP.
 * This comfortably handles admin dashboard usage (many parallel
 * fetches per page) while still blocking automated scrapers.
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  // Skip rate limiting for authenticated admin requests
  // (JWT-bearing requests are already authenticated so lower risk)
  skip: (req) => {
    const authHeader = req.headers.authorization;
    return !!(authHeader && authHeader.startsWith("Bearer "));
  },
});

/**
 * Auth limiter — login endpoint only.
 * 20 attempts per 15 minutes to block credential stuffing.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * Search limiter — public search endpoint.
 * 120 per minute — generous for debounced typing (350ms debounce
 * means max ~170 requests/min at fastest, but real usage is far lower).
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = { apiLimiter, authLimiter, searchLimiter };
