// ============================================================
// Prisma Seed — Chess Knowledge Hub
// Run: npx prisma db seed
// ============================================================
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ----------------------------------------------------------
  // Admin
  // ----------------------------------------------------------
  const passwordHash = await bcrypt.hash("ChessHub@06", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@chesshub.com" },
    // Previously `update: {}` — re-running the seed against an
    // already-seeded DB silently did nothing, so changing the
    // password here wouldn't actually update an existing admin.
    // Now upsert keeps the admin's credentials in sync with this
    // file on every seed run, same as a real "reset" would.
    update: { passwordHash, name: "Chess Hub Admin" },
    create: {
      email: "admin@chesshub.com",
      passwordHash,
      name: "Chess Hub Admin",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ----------------------------------------------------------
  // Sections
  // ----------------------------------------------------------
  const sectionsData = [
    {
      name: "Pieces",
      slug: "pieces",
      description: "Learn how each chess piece moves and captures.",
      icon: "crown",
      color: "#7F77DD",
      order: 1,
    },
    {
      name: "Rules",
      slug: "rules",
      description: "Fundamental rules: check, checkmate, castling, en passant.",
      icon: "book",
      color: "#1D9E75",
      order: 2,
    },
    {
      name: "Tactics",
      slug: "tactics",
      description: "Forks, pins, skewers, and tactical patterns.",
      icon: "sword",
      color: "#D85A30",
      order: 3,
    },
    {
      name: "Openings",
      slug: "openings",
      description: "Popular opening systems for white and black.",
      icon: "layout",
      color: "#378ADD",
      order: 4,
    },
    {
      name: "Middlegame",
      slug: "middlegame",
      description: "Planning, piece coordination, and attack.",
      icon: "chess",
      color: "#BA7517",
      order: 5,
    },
    {
      name: "Strategy",
      slug: "strategy",
      description: "Pawn structure, weak squares, and long-term plans.",
      icon: "brain",
      color: "#D4537E",
      order: 6,
    },
    {
      name: "Endgames",
      slug: "endgames",
      description: "King and pawn endings, rook endings, and technique.",
      icon: "flag",
      color: "#639922",
      order: 7,
    },
  ];

  const sections = {};
  for (const s of sectionsData) {
    const section = await prisma.section.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
    sections[s.slug] = section;
    console.log(`✅ Section: ${section.name}`);
  }

  // ----------------------------------------------------------
  // Sample Lessons
  // ----------------------------------------------------------
  const lessonsData = [
    {
      title: "How the Knight Moves",
      slug: "how-the-knight-moves",
      description:
        "The knight is the only piece that can jump over others. Learn its unique L-shaped movement.",
      difficulty: "BEGINNER",
      published: true,
      featured: true,
      sectionSlug: "pieces",
      blocks: [
        {
          type: "TEXT",
          order: 1,
          content: {
            html: '<h2>The Knight — Chess\'s Most Unique Piece</h2><p>The knight moves in an "L" shape: two squares in one direction and one square perpendicular. It is the only piece that can jump over other pieces.</p>',
          },
        },
        {
          type: "CHESSBOARD",
          order: 2,
          content: {
            fen: "8/8/8/8/4N3/8/8/8 w - - 0 1",
            orientation: "white",
            caption: "A knight on e4 can reach 8 squares.",
          },
        },
        {
          type: "ANIMATION",
          order: 3,
          content: {
            orientation: "white",
            steps: [
              {
                fen: "8/8/8/8/4N3/8/8/8 w - - 0 1",
                move: "",
                description: "Knight starts on e4.",
              },
              {
                fen: "8/8/8/3N4/8/8/8/8 w - - 0 1",
                move: "e4d6",
                description: "Knight moves to d6 — two up, one left.",
              },
              {
                fen: "8/8/5N2/8/8/8/8/8 w - - 0 1",
                move: "d6f5",
                description: "Knight jumps to f5 — one up, two right.",
              },
            ],
          },
        },
      ],
    },
    {
      title: "The Fork Tactic",
      slug: "the-fork-tactic",
      description:
        "A fork attacks two or more enemy pieces simultaneously, forcing a material loss.",
      difficulty: "BEGINNER",
      published: true,
      featured: true,
      sectionSlug: "tactics",
      blocks: [
        {
          type: "TEXT",
          order: 1,
          content: {
            html: "<h2>What is a Fork?</h2><p>A fork occurs when a single piece attacks two or more enemy pieces at the same time. The opponent can only save one, so you win material.</p>",
          },
        },
        {
          type: "ANNOTATION",
          order: 2,
          content: {
            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
            arrows: [{ from: "f3", to: "e5", color: "green" }],
            highlights: [
              { square: "c6", color: "yellow" },
              { square: "f7", color: "yellow" },
            ],
          },
        },
      ],
    },
  ];

  for (const lessonData of lessonsData) {
    const { blocks, sectionSlug, ...lessonFields } = lessonData;
    const lesson = await prisma.lesson.upsert({
      where: { slug: lessonFields.slug },
      update: {},
      create: {
        ...lessonFields,
        sectionId: sections[sectionSlug].id,
        blocks: {
          create: blocks,
        },
      },
    });
    console.log(`✅ Lesson: ${lesson.title}`);
  }

  // ----------------------------------------------------------
  // Visitor stats (last 7 days for dev)
  // ----------------------------------------------------------
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    await prisma.visitorStat.upsert({
      where: { date },
      update: {},
      create: {
        date,
        uniqueVisits: Math.floor(Math.random() * 80) + 20,
        totalVisits: Math.floor(Math.random() * 150) + 50,
      },
    });
  }
  console.log("✅ Visitor stats seeded (7 days)");

  console.log("\n🎉 Seed complete!");
  console.log("   Admin login: admin@chesshub.com / ChessHub@06");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
