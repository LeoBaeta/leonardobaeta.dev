const express = require('express');
const RSS = require('rss');
const router = express.Router();

const { formatISODate, formatRSSDate, compareDescending } = require('../lib/dates');
const { escapeXml } = require('../lib/xml');

function publishedPosts(app) {
  return [...app.locals.index.values()].sort(compareDescending);
}

function siteBase(app) {
  return String(app.locals.siteConfig.siteUrl || '').replace(/\/$/, '');
}

// GET /feed.xml - RSS 2.0
router.get('/feed.xml', (req, res) => {
  const base = siteBase(req.app);
  const feed = new RSS({
    title: 'Leonardo Baeta - Posts',
    description: 'Writing on embedded Linux, C/C++, and systems programming.',
    feed_url: `${base}/feed.xml`,
    site_url: base,
    language: 'en',
  });

  for (const post of publishedPosts(req.app)) {
    feed.item({
      title: post.title,
      url: `${base}/posts/${post.slug}`,
      guid: `${base}/posts/${post.slug}`,
      date: formatRSSDate(post.date),
      description: post.description,
    });
  }

  res.type('application/rss+xml').send(feed.xml({ indent: true }));
});

// GET /sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  const base = siteBase(req.app);
  const urls = publishedPosts(req.app).map((post) => {
    const loc = escapeXml(`${base}/posts/${post.slug}`);
    const lastmod = escapeXml(formatISODate(post.updated || post.date));
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url>\n    <loc>${escapeXml(base + '/')}</loc>\n  </url>\n` +
    `  <url>\n    <loc>${escapeXml(base + '/posts')}</loc>\n  </url>\n` +
    `${urls.join('\n')}\n</urlset>\n`;
  res.type('application/xml').send(xml);
});

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const base = siteBase(req.app);
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
});

module.exports = router;
