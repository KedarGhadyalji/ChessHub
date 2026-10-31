// ============================================================
// searchService.js
// Full-text search across lesson titles and descriptions.
// Logs every query to SearchQuery for analytics.
// ============================================================

const { PrismaClient } = require("@prisma/client");
const { parsePagination } = require("../utils/pagination");

const prisma = new PrismaClient();

/**
 * Search published lessons by title / description / section name.
 * Logs the query + result count to SearchQuery table.
 */
const search = async (query = {}) => {
  const q = (query.q || "").trim();
  const { skip, take, page, limit } = parsePagination(query);

  if (!q) return { results: [], total: 0, page, limit };

  const where = {
    published: true,
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { section: { name: { contains: q, mode: "insensitive" } } },
    ],
  };

  const [results, total] = await Promise.all([
    prisma.lesson.findMany({
      where,
      skip,
      take,
      orderBy: { title: "asc" },
      include: {
        section: {
          select: { name: true, slug: true, color: true, icon: true },
        },
      },
    }),
    prisma.lesson.count({ where }),
  ]);

  // Log query asynchronously — never block the response
  prisma.searchQuery
    .create({
      data: {
        query: q,
        resultCount: total,
        visitorId: query.visitorId || null,
      },
    })
    .catch(() => {});

  return { results, total, page, limit, query: q };
};

/**
 * Top N most-searched terms in the last `days` days.
 * Used by admin analytics.
 */
const getPopularQueries = async (limit = 10, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Aggregate raw: group by query, count occurrences
  const rows = await prisma.searchQuery.groupBy({
    by: ["query"],
    where: { createdAt: { gte: since } },
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: limit,
  });

  return rows.map((r) => ({ query: r.query, count: r._count.query }));
};

/**
 * Queries that returned zero results — content gap discovery.
 */
const getZeroResultQueries = async (limit = 10) =>
  prisma.searchQuery.findMany({
    where: { resultCount: 0 },
    distinct: ["query"],
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { query: true, createdAt: true },
  });

module.exports = { search, getPopularQueries, getZeroResultQueries };
