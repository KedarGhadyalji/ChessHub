// ============================================================
// sectionService.js
// All database logic for Section CRUD.
// ============================================================

const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middlewares/errorHandler");
const { slugify } = require("../utils/slugify");

const prisma = new PrismaClient();

const findAll = async () =>
  prisma.section.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { lessons: { where: { published: true } } } },
    },
  });

const findBySlug = async (slug) => {
  const section = await prisma.section.findUnique({
    where: { slug },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          difficulty: true,
          thumbnail: true,
        },
      },
    },
  });
  if (!section) throw new AppError("Section not found.", 404, "NOT_FOUND");
  return section;
};

const create = async (data) => {
  const slug = data.slug || slugify(data.name);
  return prisma.section.create({ data: { ...data, slug } });
};

const update = async (id, data) => {
  await findById(id);
  if (data.name && !data.slug) data.slug = slugify(data.name);
  return prisma.section.update({ where: { id }, data });
};

const remove = async (id) => {
  await findById(id);
  return prisma.section.delete({ where: { id } });
};

const findById = async (id) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw new AppError("Section not found.", 404, "NOT_FOUND");
  return section;
};

module.exports = { findAll, findBySlug, findById, create, update, remove };
