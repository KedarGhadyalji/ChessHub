// ============================================================
// suggestionController.js
// POST /api/suggestions              — public: submit
// GET  /api/admin/suggestions        — admin: list
// PUT  /api/admin/suggestions/:id    — admin: update status
// DELETE /api/admin/suggestions/:id  — admin: delete
// ============================================================

const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middlewares/errorHandler");
const { sendSuccess, sendCreated, buildMeta } = require("../utils/apiResponse");
const { parsePagination } = require("../utils/pagination");

const prisma = new PrismaClient();

const suggestionSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  type: z
    .enum(["FEEDBACK", "FEATURE_REQUEST", "BUG_REPORT", "LESSON_REQUEST"])
    .optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

const submit = async (req, res, next) => {
  try {
    const data = suggestionSchema.parse(req.body);
    const suggestion = await prisma.suggestion.create({ data });
    sendCreated(res, suggestion);
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where = req.query.status ? { status: req.query.status } : {};

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.suggestion.count({ where }),
    ]);

    sendSuccess(res, suggestions, buildMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]),
      adminNotes: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const suggestion = await prisma.suggestion.update({
      where: { id: req.params.id },
      data,
    });
    sendSuccess(res, suggestion);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await prisma.suggestion.delete({ where: { id: req.params.id } });
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, getAll, updateStatus, remove };
