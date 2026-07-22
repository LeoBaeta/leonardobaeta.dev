const express = require('express');
const router = express.Router();

const { renderPost } = require('../lib/renderer');
const renderCache = require('../lib/render-cache');
const { formatDisplayDate, compareDescending } = require('../lib/dates');
const { buildMeta, buildJsonLd } = require('../lib/meta');

// Two signals only: most posts are field notes (learning in public); a few are
// consolidated references written after a topic has clicked. Default when a post
// omits post_type is field notes.
const POST_TYPE_LABELS = {
  'field-notes': 'Field notes',
  reference: 'Reference',
};
const DEFAULT_POST_TYPE = 'field-notes';

function readingTime(markdown) {
  const words = String(markdown || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// GET /posts - chronological list of published posts
router.get('/', (req, res) => {
  const { index } = req.app.locals;
  const posts = [...index.values()]
    .sort(compareDescending)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      displayDate: formatDisplayDate(p.date),
      summary: p.excerpt || p.description,
      readingTime: readingTime(p.content),
      postTypeLabel: POST_TYPE_LABELS[p.post_type || DEFAULT_POST_TYPE] || null,
      series: p.series ? { title: p.seriesTitle, part: p.series_part } : null,
    }));

  res.render('posts', {
    title: 'Posts',
    metaDescription: 'Writing on embedded Linux, C/C++, and systems programming.',
    pageStyles: ['/css/post.css'],
    posts,
  });
});

// GET /posts/:slug - single post
router.get('/:slug', (req, res, next) => {
  const { index, highlighter } = req.app.locals;
  const post = index.get(req.params.slug);
  if (!post) return next(); // falls through to 404 handler

  let html = renderCache.get(post.slug);
  if (html === undefined) {
    html = renderPost(post, highlighter);
    renderCache.set(post.slug, html);
  }

  const siteConfig = req.app.locals.siteConfig;
  const meta = buildMeta(post, siteConfig);
  res.render('post', {
    title: meta.title,
    metaDescription: meta.description,
    pageStyles: ['/css/post.css'],
    post,
    renderedHtml: html,
    displayDate: formatDisplayDate(post.date),
    displayUpdated: post.updated ? formatDisplayDate(post.updated) : null,
    readingTime: readingTime(post.content),
    postTypeLabel: POST_TYPE_LABELS[post.post_type || DEFAULT_POST_TYPE] || null,
    meta,
    jsonLd: buildJsonLd(post, siteConfig, meta),
  });
});

module.exports = router;
