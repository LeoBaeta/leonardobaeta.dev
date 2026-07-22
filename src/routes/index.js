const express = require('express');
const router = express.Router();
const { formatDisplayDate, compareDescending } = require('../lib/dates');
const { buildSiteJsonLd } = require('../lib/meta');

function readingTime(markdown) {
  const words = String(markdown || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// GET / - landing page (Signal): identity + latest posts
router.get('/', (req, res) => {
  const { index, siteConfig } = req.app.locals;
  const recent = [...index.values()]
    .sort(compareDescending)
    .slice(0, 5)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      displayDate: formatDisplayDate(p.date),
      readingTime: readingTime(p.content),
    }));
  res.render('home', { recent, jsonLd: buildSiteJsonLd(siteConfig) });
});

// GET /about - full bio / portfolio
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About',
    metaDescription: 'Leonardo Baeta - senior embedded Linux / platform engineer focused on Yocto, C/C++, secure connected devices, and remote US/Canada teams.',
    jsonLd: buildSiteJsonLd(req.app.locals.siteConfig),
  });
});

module.exports = router;
