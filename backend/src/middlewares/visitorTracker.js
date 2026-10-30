// ============================================================
// visitorTracker.js
//
// Was: Express middleware mounted on `app.use("/api", visitorTracker)`,
// firing on EVERY GET request under /api — including the admin's
// own authenticated dashboard calls, and every one of the several
// parallel data-fetch requests a single public page load makes
// (lessons/featured, lessons/recent, sections, etc. all fire
// together on the homepage, for example). That meant:
//   - loading the admin analytics page inflated the very "visits"
//     numbers it was about to display, so refreshing it showed a
//     bigger number every time
//   - a single real visitor's one page load counted as 3-4 "visits"
//     since each parallel API call incremented the counter
//   - `uniqueVisits` incremented on every call that carried an
//     X-Visitor-Id header — which is all of them — so it wasn't
//     tracking uniqueness at all, just mirroring totalVisits
//
// Now: a plain function, `trackVisit(visitorId)`, called exactly
// ONCE per real page view via the public POST /api/track-visit
// endpoint (see routes/index.js) — not wired to route middleware
// at all, so it has no way to fire on admin traffic or on a
// page's secondary data-fetch calls. The frontend itself is
// responsible for calling it once per browser tab session (see
// App.jsx), which is also what keeps a page refresh from counting
// as a second visit.
//
// Unique-visitor dedup: an in-memory Set of visitorIds seen so far
// today, reset whenever the UTC date rolls over. This is a
// deliberate simplification — it resets on server restart, so a
// deploy could very rarely under-count "unique" by a few — but
// avoids a schema migration, and this app's traffic profile
// (a single admin's personal lesson site) doesn't need anything
// heavier. A DB-backed per-visitor-per-day table would be the next
// step up if this ever needs to run across multiple server
// instances.
// ============================================================

const { PrismaClient } = require("@prisma/client");
const { logger } = require("../utils/logger");

const prisma = new PrismaClient();

const todayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

let trackedDateKey = null;
let seenVisitorIdsToday = new Set();

const trackVisit = async (visitorId) => {
  const date = todayUTC();
  const dateKey = date.toISOString();

  if (trackedDateKey !== dateKey) {
    trackedDateKey = dateKey;
    seenVisitorIdsToday = new Set();
  }

  const isFirstTimeToday = Boolean(visitorId) && !seenVisitorIdsToday.has(visitorId);
  if (visitorId) seenVisitorIdsToday.add(visitorId);

  try {
    await prisma.visitorStat.upsert({
      where: { date },
      update: {
        totalVisits: { increment: 1 },
        ...(isFirstTimeToday ? { uniqueVisits: { increment: 1 } } : {}),
      },
      create: {
        date,
        totalVisits: 1,
        uniqueVisits: isFirstTimeToday ? 1 : 0,
      },
    });
  } catch (err) {
    logger.warn("trackVisit failed silently", { error: err.message });
  }
};

module.exports = { trackVisit };
