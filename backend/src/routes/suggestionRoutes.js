const router = require("express").Router();
const ctrl = require("../controllers/suggestionController");
const { requireAuth } = require("../middlewares/authMiddleware");

// Public
router.post("/", ctrl.submit);

// Admin
router.get("/", requireAuth, ctrl.getAll);
router.put("/:id", requireAuth, ctrl.updateStatus);
router.delete("/:id", requireAuth, ctrl.remove);

module.exports = router;
