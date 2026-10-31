// ============================================================
// sectionController.js
// GET    /api/sections              — public: all sections
// GET    /api/sections/:slug        — public: section + lessons
// POST   /api/admin/sections        — admin: create
// PUT    /api/admin/sections/:id    — admin: update
// DELETE /api/admin/sections/:id    — admin: delete
// ============================================================

const { z } = require("zod");
const sectionService = require("../services/sectionService");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");

const sectionSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(60).optional(),
  description: z.string().max(300).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

const getAll = async (req, res, next) => {
  try {
    const sections = await sectionService.findAll();
    sendSuccess(res, sections);
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const section = await sectionService.findBySlug(req.params.slug);
    sendSuccess(res, section);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = sectionSchema.parse(req.body);
    const section = await sectionService.create(data);
    sendCreated(res, section);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = sectionSchema.partial().parse(req.body);
    const section = await sectionService.update(req.params.id, data);
    sendSuccess(res, section);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await sectionService.remove(req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getBySlug, create, update, remove };
