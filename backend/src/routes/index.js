// ============================================================
// routes/index.js
// Central router — mounts all sub-routers under /api
// ============================================================

const router = require("express").Router();
const { trackVisit } = require("../middlewares/visitorTracker");

router.use("/auth", require("./authRoutes"));
router.use("/sections", require("./sectionRoutes"));
router.use("/lessons", require("./lessonRoutes"));
router.use("/search", require("./searchRoutes"));
router.use("/suggestions", require("./suggestionRoutes"));
router.use("/analytics", require("./analyticsRoutes"));

// Public, unauthenticated — called by the frontend exactly ONCE per
// browser tab session (see App.jsx), not on every API call. This is
// what replaced the old blanket per-request tracking middleware;
// see middlewares/visitorTracker.js for the full story on why.
router.post("/track-visit", (req, res) => {
  trackVisit(req.headers["x-visitor-id"] || null);
  res.status(204).end();
});

// Health check
router.get("/health", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() }),
);

module.exports = router;
