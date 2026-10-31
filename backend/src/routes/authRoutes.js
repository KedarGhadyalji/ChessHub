const router = require("express").Router();
const ctrl = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/login", authLimiter, ctrl.login);
router.get("/me", requireAuth, ctrl.getMe);
router.post("/refresh", requireAuth, ctrl.refresh);

module.exports = router;
