'use strict';

const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const PUBLIC_EMBEDS_DIR = path.resolve(PUBLIC_DIR, 'embeds');

const REQUIRED_FIELDS = ['title', 'date', 'slug', 'description', 'status'];
const SLUG_REGEX = /^[a-z0-9-]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }

  const dateStr = String(value);
  if (!DATE_REGEX.test(dateStr)) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const normalized = new Date(Date.UTC(year, month - 1, day));
  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day
  ) {
    return null;
  }

  return dateStr;
}

/**
 * Build the post index, series index, and redirect map from pre-read file contents.
 * Pure function - no filesystem side effects except embed path existence check.
 *
 * @param {{ filepath: string, content: string }[]} files
 * @returns {{ index: Map<string, object>, redirectMap: Map<string, string>, errors: object[] }}
 */
function buildPostIndex(files) {
  const errors = [];
  const rawPosts = [];
  const isProduction = process.env.NODE_ENV !== 'development';

  for (const { filepath, content } of files) {
    try {
      const { data: fm, content: body } = matter(content);

      // Required field validation
      const missingField = REQUIRED_FIELDS.find(f => !fm[f]);
      if (missingField) {
        errors.push({ file: filepath, slug: fm.slug || '', field: missingField, message: `missing field: ${missingField}` });
        console.warn(`[WARN] post-index: skipping ${filepath} - missing field: ${missingField}`);
        continue;
      }

      // Slug format validation
      if (!SLUG_REGEX.test(String(fm.slug))) {
        errors.push({ file: filepath, slug: fm.slug, field: 'slug', message: `invalid slug format: ${fm.slug}` });
        console.warn(`[WARN] post-index: skipping ${filepath} - invalid slug format: ${fm.slug}`);
        continue;
      }

      // Date format validation: gray-matter parses YAML dates as JS Date objects
      // (UTC midnight), so we must use toISOString() to recover the calendar date.
      const dateStr = normalizeDate(fm.date);
      if (!dateStr) {
        errors.push({ file: filepath, slug: fm.slug, field: 'date', message: `invalid date format: ${fm.date}` });
        console.warn(`[WARN] post-index: skipping ${filepath} - invalid date format: ${fm.date}`);
        continue;
      }

      // Draft filtering
      if (isProduction && fm.status === 'draft') continue;

      // Embed path validation (NFR6)
      let validatedEmbed = null;
      if (fm.embed) {
        const rawEmbedPath = String(fm.embed);
        const resolved = path.resolve(PUBLIC_EMBEDS_DIR, rawEmbedPath);
        if (
          !resolved.startsWith(PUBLIC_EMBEDS_DIR + path.sep) ||
          !rawEmbedPath.endsWith('.wasm') ||
          !fs.existsSync(resolved)
        ) {
          errors.push({ file: filepath, slug: String(fm.slug), field: 'embed', message: `invalid or missing embed path: ${rawEmbedPath}` });
          console.warn(`[WARN] post-index: invalid embed path - ${filepath}: ${rawEmbedPath}`);
        } else {
          validatedEmbed = rawEmbedPath;
        }
      }

      rawPosts.push({
        ...fm,
        date: dateStr,             // normalised ISO string
        content: body,             // raw markdown body for renderer
        embed: validatedEmbed,
        _filepath: filepath,
      });
    } catch (err) {
      errors.push({ file: filepath, slug: '', field: '', message: err.message });
      console.warn(`[WARN] post-index: skipping ${filepath} - ${err.message}`);
    }
  }

  // Sort alphabetically for deterministic slug collision resolution
  rawPosts.sort((a, b) => a._filepath.localeCompare(b._filepath));

  // Build slug index with collision detection
  const index = new Map();
  const seenFiles = new Map(); // slug -> filepath of winning post

  for (const post of rawPosts) {
    const slug = String(post.slug);
    if (index.has(slug)) {
      const existing = seenFiles.get(slug);
      errors.push({ file: post._filepath, slug, field: 'slug', message: `duplicate slug - keeping ${existing}` });
      console.warn(`[WARN] post-index: duplicate slug '${slug}' - keeping ${existing}, skipping ${post._filepath}`);
      continue;
    }
    seenFiles.set(slug, post._filepath);
    const { _filepath, ...postMeta } = post; // strip internal field
    index.set(slug, { ...postMeta, prev: null, next: null, total: 0, seriesTitle: '' });
  }

  // Build series index
  const seriesGroups = new Map(); // seriesSlug -> PostMeta[]
  for (const [, post] of index) {
    if (post.series) {
      if (!seriesGroups.has(post.series)) seriesGroups.set(post.series, []);
      seriesGroups.get(post.series).push(post);
    }
  }

  for (const [seriesSlug, members] of seriesGroups) {
    members.sort((a, b) => (Number(a.series_part) || 0) - (Number(b.series_part) || 0));
    for (let i = 0; i < members.length; i++) {
      const post = index.get(String(members[i].slug));
      post.prev = i > 0 ? index.get(String(members[i - 1].slug)) : null;
      post.next = i < members.length - 1 ? index.get(String(members[i + 1].slug)) : null;
      post.total = members.length;
      post.seriesTitle = seriesSlug;
    }
  }

  // Build redirect map from redirectFrom arrays
  const redirectMap = new Map();
  for (const [slug, post] of index) {
    if (!Array.isArray(post.redirectFrom)) continue;
    for (const oldSlug of post.redirectFrom) {
      if (typeof oldSlug !== 'string' || !SLUG_REGEX.test(oldSlug) || oldSlug === slug) {
        errors.push({ file: '', slug, field: 'redirectFrom', message: `invalid redirect slug: ${oldSlug}` });
        console.warn(`[WARN] post-index: invalid redirect slug '${oldSlug}' - skipping`);
        continue;
      }
      if (redirectMap.has(oldSlug)) {
        console.warn(`[WARN] post-index: redirect collision on '${oldSlug}'`);
        continue;
      }
      redirectMap.set(oldSlug, slug);
    }
  }

  // Remove every entry participating in a redirect cycle.
  for (const oldSlug of [...redirectMap.keys()]) {
    const pathSeen = new Map();
    let current = oldSlug;

    while (redirectMap.has(current)) {
      if (pathSeen.has(current)) {
        const cycle = [...pathSeen.keys()].slice(pathSeen.get(current));
        console.warn(`[WARN] post-index: redirect cycle detected: ${cycle.join(' -> ')} -> ${current}`);
        for (const cycleSlug of cycle) redirectMap.delete(cycleSlug);
        break;
      }

      pathSeen.set(current, pathSeen.size);
      current = redirectMap.get(current);
    }
  }

  for (const oldSlug of [...redirectMap.keys()]) {
    if (index.has(oldSlug)) {
      console.warn(`[WARN] post-index: redirect collision on '${oldSlug}'`);
      redirectMap.delete(oldSlug);
    }
  }

  return { index, redirectMap, errors };
}

/**
 * Scan a directory for .md files and return their contents.
 * This is the only filesystem-touching helper; buildPostIndex is pure.
 *
 * @param {string} postsDir
 * @returns {{ filepath: string, content: string }[]}
 */
function scanPosts(postsDir) {
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir)
    // `_`-prefixed files are drafts/backups - excluded from the published index.
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .sort() // alphabetical for deterministic behaviour
    .map(f => {
      const filepath = path.join(postsDir, f);
      return { filepath, content: fs.readFileSync(filepath, 'utf8') };
    });
}

module.exports = { buildPostIndex, scanPosts };
