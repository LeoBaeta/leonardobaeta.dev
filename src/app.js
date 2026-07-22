const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config');
const securityMiddleware = require('./middleware/security');
const redirectMiddleware = require('./middleware/redirects');
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const feedsRouter = require('./routes/feeds');
const healthRouter = require('./routes/health');

const app = express();

// Security headers
app.use(securityMiddleware(config.gaMeasurementId));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Per-request view locals
app.use((req, res, next) => {
  res.locals.gaMeasurementId = config.gaMeasurementId;
  res.locals.siteConfig = app.locals.siteConfig;
  res.locals.currentPath = req.path;
  next();
});

// Routes - order is load-bearing: redirects must run before the posts router.
app.use('/', indexRouter);
app.use(redirectMiddleware);
app.use('/posts', postsRouter);
app.use('/', feedsRouter);
app.use('/', healthRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not found', pageStyles: ['/css/post.css'] });
});

// 500 handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).render('500', { title: 'Error', pageStyles: ['/css/post.css'] });
});

module.exports = app;
