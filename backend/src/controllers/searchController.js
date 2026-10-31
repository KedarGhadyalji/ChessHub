// ============================================================
// searchController.js
// GET /api/search?q=fork&page=1&limit=12
// ============================================================

const searchService = require("../services/searchService");
const { sendSuccess, buildMeta } = require("../utils/apiResponse");

const search = async (req, res, next) => {
  try {
    const { results, total, page, limit, query } = await searchService.search({
      ...req.query,
      visitorId: req.headers["x-visitor-id"] || null,
    });
    sendSuccess(res, { results, query }, buildMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
