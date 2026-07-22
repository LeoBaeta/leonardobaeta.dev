'use strict';

// 301 redirects for renamed post slugs. The redirect map is built once at
// startup in bootstrap (from each post's `redirectFrom` frontmatter) and
// stored on app.locals. Mounted before the posts router.
const PREFIX = '/posts/';

function redirectMiddleware(req, res, next) {
  if (!req.path.startsWith(PREFIX)) return next();
  const oldSlug = req.path.slice(PREFIX.length);
  const target = req.app.locals.redirectMap.get(oldSlug);
  if (target) return res.redirect(301, `${PREFIX}${target}`);
  next();
}

module.exports = redirectMiddleware;
