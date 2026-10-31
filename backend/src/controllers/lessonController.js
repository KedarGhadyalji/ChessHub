// ============================================================
// lessonController.js
// GET    /api/lessons                        — public list (supports ?tag=)
// GET    /api/lessons/featured                — public featured
// GET    /api/lessons/recent                  — public recent
// GET    /api/lessons/tags                    — public: all distinct tags
// GET    /api/lessons/:slug                   — public viewer (supports ?preview=token)
// POST   /api/lessons/:slug/view              — record view event
// GET    /api/admin/lessons                   — admin list
// GET    /api/admin/lessons/:id               — admin single
// POST   /api/admin/lessons                   — admin create
// PUT    /api/admin/lessons/:id               — admin update
// DELETE /api/admin/lessons/:id               — admin delete
// POST   /api/admin/lessons/:id/duplicate     — admin: clone lesson as draft
// POST   /api/admin/lessons/:id/preview-link  — admin: generate draft-preview token
// DELETE /api/admin/lessons/:id/preview-link  — admin: revoke draft-preview token
// ============================================================

const { z } = require("zod");
const lessonService = require("../services/lessonService");
const { sendSuccess, sendCreated, buildMeta } = require("../utils/apiResponse");

// ---- Zod schemas -------------------------------------------

const blockContentSchema = z.record(z.unknown()); // flexible JSON per block type

const blockSchema = z.object({
  type: z.enum(["TEXT", "CHESSBOARD", "ANNOTATION", "ANIMATION"]),
  content: blockContentSchema,
  order: z.number().int().optional(),
});

const lessonSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  sectionId: z.string().cuid(),
  blocks: z.array(blockSchema).optional(),
});

// ---- Public handlers ----------------------------------------

const getPublished = async (req, res, next) => {
  try {
    const { lessons, total, page, limit } = await lessonService.findPublished(
      req.query,
    );
    sendSuccess(res, lessons, buildMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const lessons = await lessonService.findFeatured(
      Number(req.query.limit) || 6,
    );
    sendSuccess(res, lessons);
  } catch (err) {
    next(err);
  }
};

const getRecent = async (req, res, next) => {
  try {
    const lessons = await lessonService.findRecent(
      Number(req.query.limit) || 6,
    );
    sendSuccess(res, lessons);
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const lesson = await lessonService.findBySlug(
      req.params.slug,
      req.query.preview || null,
    );
    sendSuccess(res, lesson);
  } catch (err) {
    next(err);
  }
};

const getTags = async (req, res, next) => {
  try {
    const tags = await lessonService.findAllTags();
    sendSuccess(res, tags);
  } catch (err) {
    next(err);
  }
};

const recordView = async (req, res, next) => {
  try {
    const lesson = await lessonService.findBySlug(req.params.slug);
    lessonService.recordView(lesson.id, {
      visitorId: req.headers["x-visitor-id"] || null,
      referrer: req.headers.referer || null,
      userAgent: req.headers["user-agent"] || null,
    });
    sendSuccess(res, { recorded: true });
  } catch (err) {
    next(err);
  }
};

// ---- Admin handlers -----------------------------------------

const getAllAdmin = async (req, res, next) => {
  try {
    const { lessons, total, page, limit } = await lessonService.findAllAdmin(
      req.query,
    );
    sendSuccess(res, lessons, buildMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getByIdAdmin = async (req, res, next) => {
  try {
    const lesson = await lessonService.findById(req.params.id);
    sendSuccess(res, lesson);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = lessonSchema.parse(req.body);
    const lesson = await lessonService.create(data);
    sendCreated(res, lesson);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = lessonSchema.partial().parse(req.body);
    const lesson = await lessonService.update(req.params.id, data);
    sendSuccess(res, lesson);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await lessonService.remove(req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

const duplicate = async (req, res, next) => {
  try {
    const lesson = await lessonService.duplicate(req.params.id);
    sendCreated(res, lesson);
  } catch (err) {
    next(err);
  }
};

const createPreviewLink = async (req, res, next) => {
  try {
    const previewToken = await lessonService.generatePreviewToken(
      req.params.id,
    );
    sendSuccess(res, { previewToken });
  } catch (err) {
    next(err);
  }
};

const revokePreviewLink = async (req, res, next) => {
  try {
    await lessonService.revokePreviewToken(req.params.id);
    sendSuccess(res, { revoked: true });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await lessonService.getStats();
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublished,
  getFeatured,
  getRecent,
  getBySlug,
  getTags,
  recordView,
  getAllAdmin,
  getByIdAdmin,
  create,
  update,
  remove,
  duplicate,
  createPreviewLink,
  revokePreviewLink,
  getStats,
};
