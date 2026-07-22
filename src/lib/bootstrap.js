'use strict';

const path = require('path');
const config = require('../config');
const { buildPostIndex, scanPosts } = require('./post-index');

const POSTS_DIR = path.join(__dirname, '..', '..', 'posts');

// Languages we actually use in posts. Keeping this list tight keeps shiki's
// startup and memory footprint small (vs. loading the full bundle).
const LANGS = ['c', 'cpp', 'bash', 'yaml', 'javascript', 'typescript', 'makefile', 'diff'];

/**
 * Initialise the highlighter, build the post index, and populate app.locals.
 * Throws on shiki-init or index-build failure so the caller can exit(1) - the
 * server must not start in a half-initialised state (FR4 / "fail loud").
 *
 * @param {import('express').Application} app
 */
async function bootstrap(app) {
  if (config.nodeEnv === 'production' && !process.env.SITE_URL) {
    throw new Error('SITE_URL env var must be set in production');
  }

  const start = Date.now();

  // shiki is ESM-only; reach it from CommonJS via dynamic import().
  const { createHighlighter } = await import('shiki');
  const highlighter = await createHighlighter({
    themes: ['night-owl'],
    langs: LANGS,
  });

  const files = scanPosts(POSTS_DIR);
  const { index, redirectMap, errors } = buildPostIndex(files);

  for (const e of errors) {
    console.warn(`[WARN] bootstrap: ${e.file || e.slug} - ${e.message}`);
  }

  app.locals.index = index;
  app.locals.redirectMap = redirectMap;
  app.locals.highlighter = highlighter;
  app.locals.siteConfig = {
    siteUrl: config.siteUrl,
    ogImage: config.siteOgImage,
    authorName: config.authorName,
    authorBio: config.authorBio,
    authorGithub: config.authorGithub,
    authorLinkedIn: config.authorLinkedIn,
  };

  console.log(`[INFO] bootstrap: ${index.size} post(s) indexed in ${Date.now() - start}ms`);
}

module.exports = { bootstrap };
