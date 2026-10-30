// ============================================================
// pagination.js
// Derives skip/take from query params for Prisma queries.
// ============================================================

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

/**
 * Parse page / limit from Express query params.
 * @param {object} query - req.query
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};

module.exports = { parsePagination, DEFAULT_LIMIT };
