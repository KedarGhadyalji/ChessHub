// ============================================================
// authService.js
// Handles admin login: credential validation + JWT signing.
// ============================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middlewares/errorHandler");

const prisma = new PrismaClient();

/**
 * Validate admin credentials and return a signed JWT.
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string, admin: object }}
 */
const login = async (email, password) => {
  const admin = await prisma.admin.findUnique({ where: { email } });

  // Constant-time comparison to prevent timing attacks
  const isValid = admin
    ? await bcrypt.compare(password, admin.passwordHash)
    : await bcrypt.compare(
        password,
        "$2a$12$invalidhashpadding000000000000000000000000000000000",
      );

  if (!admin || !isValid) {
    throw new AppError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "90d" },
  );

  return {
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  };
};

/**
 * Return the current admin profile (used by /admin/me).
 */
const getProfile = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!admin) throw new AppError("Admin not found.", 404, "NOT_FOUND");
  return admin;
};

/**
 * Re-sign a fresh JWT for an already-authenticated admin, extending
 * their session by another full JWT_EXPIRES_IN window. Called by the
 * frontend on every app load and periodically while a tab stays
 * open, so an admin who's actively using the panel effectively
 * never sees the login screen — the token only actually expires if
 * the panel goes completely unused for the full window (default
 * 90 days). Re-fetches from the DB (rather than just re-signing the
 * existing payload) so a deleted/disabled admin can't refresh their
 * way to a valid token forever.
 */
const refresh = async (adminId) => {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw new AppError("Admin not found.", 404, "NOT_FOUND");

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "90d" },
  );

  return {
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  };
};

module.exports = { login, getProfile, refresh };
