// ============================================================
// app.js
// Creates and configures the Express application.
// Separated from server.js so it can be imported in tests.
// ============================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const router = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");
const { logger } = require("./utils/logger");

const app = express();

// ---- Security & utility middleware -------------------------
app.use(helmet());
app.use(compression());

// CORS: supports a comma-separated allow-list in CLIENT_ORIGIN
// (e.g. "https://chesshub.com,https://staging.chesshub.com" in
// production), plus — in development only — trusts ANY
// localhost/127.0.0.1 origin regardless of port.
//
// Why: Vite auto-increments its dev port (5173 → 5174 → 5175 …)
// whenever the previous one is already taken, e.g. by another
// project's dev server left running. A single hardcoded
// CLIENT_ORIGIN then blocks the app the instant that happens —
// exactly what was going on here. Production keeps strict
// exact-match origin checking; only local dev gets the wildcard.
const isDev = process.env.NODE_ENV !== "production";
const configuredOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header = same-origin request, curl, server-to-
      // server health checks, etc. — nothing to check against.
      if (!origin) return callback(null, true);

      if (configuredOrigins.includes(origin)) return callback(null, true);

      if (isDev && localhostPattern.test(origin)) return callback(null, true);

      callback(new Error(`CORS: origin "${origin}" is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Visitor-Id"],
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Logging -----------------------------------------------
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ---- Rate limiting (applied to all /api/* routes) ----------
app.use("/api", apiLimiter);

// ---- API routes --------------------------------------------
// (visitor tracking is no longer blanket middleware here — see
// POST /api/track-visit in routes/index.js for why)
app.use("/api", router);

// ---- 404 for unknown routes --------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found.`,
    },
  });
});

// ---- Global error handler (must be last) -------------------
app.use(errorHandler);

module.exports = app;
