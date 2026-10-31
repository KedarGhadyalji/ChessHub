// ============================================================
// authController.js
// POST /api/auth/login
// GET  /api/auth/me  (protected)
// ============================================================

const { z } = require("zod");
const authService = require("../services/authService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.admin.id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.admin.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, refresh };
