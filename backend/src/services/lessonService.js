// ============================================================
// lessonService.js
// All database logic for Lesson CRUD, view tracking,
// featured/recent queries, and admin management.
// ============================================================

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const { AppError } = require("../middlewares/errorHandler");
const { slugify } = require("../utils/slugify");
const { parsePagination } = require("../utils/pagination");

const prisma = new PrismaClient();

// ---- Public queries ----------------------------------------

/**
 * List published lessons with optional section/difficulty/tag
 * filter + pagination.
 */
const findPublished = async (query = {}) => {
  const { skip, take, page, limit } = parsePagination(query);
  const where = {
    published: true,
    ...(query.section && { section: { slug: query.section } }),
    ...(query.difficulty && { difficulty: query.difficulty.toUpperCase() }),
    ...(query.tag && { tags: { has: query.tag } }),
  };

  const [lessons, total] = await Promise.all([
    prisma.lesson.findMany({
      where,
      skip,
      take,
      orderBy: { order: "asc" },
      include: {
        section: {
          select: { id: true, name: true, slug: true, color: true, icon: true },
        },
        _count: { select: { views: true } },
      },
    }),
    prisma.lesson.count({ where }),
  ]);

  return { lessons, total, page, limit };
};

/**
 * Get a single lesson by slug, including all blocks and a handful
 * of related lessons.
 *
 * Normally only published lessons are returned. If `previewToken`
 * is supplied AND matches this lesson's stored token, an
 * unpublished draft is returned too — this is what powers the
 * admin's shareable "preview this draft" link. A wrong or missing
 * token never leaks a draft; it just falls through to the
 * published-only check.
 */
const findBySlug = async (slug, previewToken = null) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      slug,
      OR: [{ published: true }, ...(previewToken ? [{ previewToken }] : [])],
    },
    include: {
      section: {
        select: { id: true, name: true, slug: true, color: true, icon: true },
      },
      blocks: { orderBy: { order: "asc" } },
      _count: { select: { views: true } },
    },
  });
  if (!lesson) throw new AppError("Lesson not found.", 404, "NOT_FOUND");

  const relatedLessons = await findRelated(lesson);
  return { ...lesson, relatedLessons };
};

/**
 * Other lessons worth showing at the bottom of this one — same
 * section first, or sharing at least one tag, published only,
 * excluding itself. Deliberately simple (no relevance scoring)
 * since this is a personal lesson site with a modest catalog, not
 * a recommendation engine.
 */
const findRelated = async (lesson, limit = 4) => {
  if (!lesson) return [];
  return prisma.lesson.findMany({
    where: {
      id: { not: lesson.id },
      published: true,
      OR: [
        { sectionId: lesson.sectionId },
        ...(lesson.tags?.length ? [{ tags: { hasSome: lesson.tags } }] : []),
      ],
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnail: true,
      difficulty: true,
      tags: true,
      section: { select: { name: true, slug: true, color: true, icon: true } },
    },
  });
};

/**
 * All distinct tags currently used by published lessons — powers
 * the tag filter UI on the public lessons page.
 */
const findAllTags = async () => {
  const lessons = await prisma.lesson.findMany({
    where: { published: true },
    select: { tags: true },
  });
  const tagSet = new Set();
  lessons.forEach((l) => l.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
};

/**
 * Get featured lessons for the homepage.
 */
const findFeatured = async (limit = 6) =>
  prisma.lesson.findMany({
    where: { published: true, featured: true },
    take: limit,
    orderBy: { order: "asc" },
    include: {
      section: { select: { name: true, slug: true, color: true, icon: true } },
    },
  });

/**
 * Get most recently updated published lessons.
 */
const findRecent = async (limit = 6) =>
  prisma.lesson.findMany({
    where: { published: true },
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      section: { select: { name: true, slug: true, color: true, icon: true } },
    },
  });

/**
 * Record a lesson view event.
 *
 * De-duplicated per visitor per lesson within VIEW_DEDUP_WINDOW_MS:
 * previously this inserted a brand-new row on every single call
 * with no protection at all, so page reloads, back/forward
 * navigation, and React's StrictMode double-invoking effects in
 * development were each counted as a separate view — "views" was
 * effectively tracking every render/reload rather than distinct
 * visits. Re-using the same visitorId (already sent by the
 * frontend) within the window is treated as the same visit and
 * skipped, using the existing [lessonId, createdAt] index so this
 * needs no schema change.
 */
const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

const recordView = async (lessonId, meta = {}) => {
  // Fire-and-forget: don't await, don't throw — view tracking must
  // never slow down or break the request that triggered it.
  (async () => {
    try {
      if (meta.visitorId) {
        const recent = await prisma.lessonView.findFirst({
          where: {
            lessonId,
            visitorId: meta.visitorId,
            createdAt: { gte: new Date(Date.now() - VIEW_DEDUP_WINDOW_MS) },
          },
          select: { id: true },
        });
        if (recent) return; // already counted this visit — skip
      }
      await prisma.lessonView.create({ data: { lessonId, ...meta } });
    } catch {
      /* view tracking must never break the request */
    }
  })();
};

// ---- Admin queries -----------------------------------------

/**
 * List ALL lessons (published + draft) for admin, with pagination.
 */
const findAllAdmin = async (query = {}) => {
  const { skip, take, page, limit } = parsePagination(query);
  const where = {
    ...(query.section && { section: { slug: query.section } }),
    ...(query.published !== undefined && {
      published: query.published === "true",
    }),
  };

  const [lessons, total] = await Promise.all([
    prisma.lesson.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: "desc" },
      include: {
        section: { select: { id: true, name: true, slug: true, color: true } },
        _count: { select: { views: true, blocks: true } },
      },
    }),
    prisma.lesson.count({ where }),
  ]);

  return { lessons, total, page, limit };
};

/**
 * Get a single lesson by ID (admin — includes drafts + blocks).
 */
const findById = async (id) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      section: true,
      blocks: { orderBy: { order: "asc" } },
    },
  });
  if (!lesson) throw new AppError("Lesson not found.", 404, "NOT_FOUND");
  return lesson;
};

/**
 * Create a new lesson with optional blocks.
 */
const create = async (data) => {
  const { blocks = [], ...lessonData } = data;
  const slug = lessonData.slug || slugify(lessonData.title);

  return prisma.lesson.create({
    data: {
      ...lessonData,
      slug,
      blocks: {
        create: blocks.map((b, i) => ({ ...b, order: b.order ?? i })),
      },
    },
    include: { blocks: { orderBy: { order: "asc" } }, section: true },
  });
};

/**
 * Update lesson fields and replace blocks entirely.
 * A full block replacement is simpler than diffing and safer
 * for the lesson builder's save-all-at-once model.
 */
const update = async (id, data) => {
  await findById(id);
  const { blocks, ...lessonData } = data;
  if (lessonData.title && !lessonData.slug)
    lessonData.slug = slugify(lessonData.title);

  return prisma.$transaction(async (tx) => {
    if (blocks !== undefined) {
      await tx.lessonBlock.deleteMany({ where: { lessonId: id } });
      await tx.lessonBlock.createMany({
        data: blocks.map((b, i) => ({
          ...b,
          lessonId: id,
          order: b.order ?? i,
        })),
      });
    }
    return tx.lesson.update({
      where: { id },
      data: lessonData,
      include: { blocks: { orderBy: { order: "asc" } }, section: true },
    });
  });
};

/**
 * Delete lesson and cascade-delete blocks + views.
 */
const remove = async (id) => {
  await findById(id);
  return prisma.lesson.delete({ where: { id } });
};

/**
 * Clone a lesson and all of its blocks. The copy is always
 * created unpublished (and un-featured) regardless of the
 * original's state — duplicating a live lesson shouldn't
 * immediately publish a half-edited copy of it. Slug gets a
 * "-copy" / "-copy-2" / ... suffix, whichever's free first.
 */
const duplicate = async (id) => {
  const original = await findById(id);

  let slug = `${original.slug}-copy`;
  let suffix = 2;
  while (await prisma.lesson.findUnique({ where: { slug } })) {
    slug = `${original.slug}-copy-${suffix}`;
    suffix += 1;
  }

  return prisma.lesson.create({
    data: {
      title: `${original.title} (Copy)`,
      slug,
      description: original.description,
      thumbnail: original.thumbnail,
      difficulty: original.difficulty,
      published: false,
      featured: false,
      order: original.order,
      tags: original.tags,
      sectionId: original.sectionId,
      blocks: {
        create: original.blocks.map((b, i) => ({
          type: b.type,
          content: b.content,
          order: b.order ?? i,
        })),
      },
    },
    include: { blocks: { orderBy: { order: "asc" } }, section: true },
  });
};

/**
 * Generate (or replace) a shareable draft-preview token for a
 * lesson — lets an admin send someone a link to an unpublished
 * lesson without making it public. Calling this again invalidates
 * any previously shared link, since the old token stops matching.
 */
const generatePreviewToken = async (id) => {
  await findById(id);
  const previewToken = crypto.randomBytes(16).toString("hex");
  const lesson = await prisma.lesson.update({
    where: { id },
    data: { previewToken },
  });
  return lesson.previewToken;
};

/**
 * Revoke a lesson's preview link — any link previously shared
 * stops working immediately.
 */
const revokePreviewToken = async (id) => {
  await findById(id);
  await prisma.lesson.update({ where: { id }, data: { previewToken: null } });
};

/**
 * Dashboard stats: total lessons, published count, draft count.
 */
const getStats = async () => {
  const [total, published, featured] = await Promise.all([
    prisma.lesson.count(),
    prisma.lesson.count({ where: { published: true } }),
    prisma.lesson.count({ where: { published: true, featured: true } }),
  ]);
  return { total, published, draft: total - published, featured };
};

module.exports = {
  findPublished,
  findBySlug,
  findRelated,
  findAllTags,
  findFeatured,
  findRecent,
  recordView,
  findAllAdmin,
  findById,
  create,
  update,
  remove,
  duplicate,
  generatePreviewToken,
  revokePreviewToken,
  getStats,
};
