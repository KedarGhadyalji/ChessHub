const router = require("express").Router();
const ctrl = require("../controllers/lessonController");
const { requireAuth } = require("../middlewares/authMiddleware");

// Public
router.get("/", ctrl.getPublished);
router.get("/featured", ctrl.getFeatured);
router.get("/recent", ctrl.getRecent);
router.get("/tags", ctrl.getTags);
router.get("/stats", requireAuth, ctrl.getStats);
router.get("/:slug", ctrl.getBySlug);
router.post("/:slug/view", ctrl.recordView);

// Admin
router.get("/admin/all", requireAuth, ctrl.getAllAdmin);
router.get("/admin/:id", requireAuth, ctrl.getByIdAdmin);
router.post("/admin", requireAuth, ctrl.create);
router.put("/admin/:id", requireAuth, ctrl.update);
router.delete("/admin/:id", requireAuth, ctrl.remove);
router.post("/admin/:id/duplicate", requireAuth, ctrl.duplicate);
router.post("/admin/:id/preview-link", requireAuth, ctrl.createPreviewLink);
router.delete("/admin/:id/preview-link", requireAuth, ctrl.revokePreviewLink);

module.exports = router;
