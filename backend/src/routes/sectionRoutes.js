const router = require("express").Router();
const ctrl = require("../controllers/sectionController");
const { requireAuth } = require("../middlewares/authMiddleware");

// Public
router.get("/", ctrl.getAll);
router.get("/:slug", ctrl.getBySlug);

// Admin
router.post("/", requireAuth, ctrl.create);
router.put("/:id", requireAuth, ctrl.update);
router.delete("/:id", requireAuth, ctrl.remove);

module.exports = router;
