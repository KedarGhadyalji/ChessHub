// ============================================================
// slugify.js
// Converts a string into a URL-safe slug.
// e.g. "How the Knight Moves!" → "how-the-knight-moves"
// ============================================================

/**
 * @param {string} str
 * @returns {string}
 */
const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphens
    .replace(/[^\w-]+/g, "") // remove non-word chars
    .replace(/--+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

module.exports = { slugify };
