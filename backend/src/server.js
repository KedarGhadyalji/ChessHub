// ============================================================
// server.js
// HTTP server entry point.
// Handles startup, graceful shutdown, and unhandled rejections.
// ============================================================

require("dotenv").config();

const app = require("./app");
const { logger } = require("./utils/logger");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`Chess Knowledge Hub API running`, {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});

// ---- Graceful shutdown -------------------------------------
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Database disconnected. Process exiting.");
    process.exit(0);
  });

  // Force exit if server takes too long to close
  setTimeout(() => {
    logger.error("Forced exit after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ---- Unhandled promise rejections --------------------------
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", { reason: String(reason) });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

module.exports = server;
