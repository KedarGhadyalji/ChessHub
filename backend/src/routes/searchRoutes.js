// searchRoutes.js
const searchRouter = require("express").Router();
const searchCtrl = require("../controllers/searchController");
const { searchLimiter } = require("../middlewares/rateLimiter");
searchRouter.get("/", searchLimiter, searchCtrl.search);
module.exports = searchRouter;

// ---- suggestion routes exported separately ----
// (imported by index.js individually)
