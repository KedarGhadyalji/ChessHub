// ============================================================
// logger.js
// Lightweight logger. Uses JSON format in production for
// easy ingestion by log aggregators (Datadog, Logtail, etc.)
// ============================================================

const isProd = process.env.NODE_ENV === "production";

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = isProd ? levels.info : levels.debug;

const format = (level, message, meta = {}) => {
  if (isProd) {
    return JSON.stringify({
      level,
      message,
      ...meta,
      ts: new Date().toISOString(),
    });
  }
  const ts = new Date().toLocaleTimeString();
  const prefix = { error: "✖", warn: "⚠", info: "●", debug: "○" }[level] || "·";
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${ts}] ${prefix} ${message}${metaStr}`;
};

const logger = {
  error: (msg, meta) =>
    levels.error <= currentLevel && console.error(format("error", msg, meta)),
  warn: (msg, meta) =>
    levels.warn <= currentLevel && console.warn(format("warn", msg, meta)),
  info: (msg, meta) =>
    levels.info <= currentLevel && console.log(format("info", msg, meta)),
  debug: (msg, meta) =>
    levels.debug <= currentLevel && console.log(format("debug", msg, meta)),
};

module.exports = { logger };
