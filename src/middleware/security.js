const helmet = require('helmet');

function securityMiddleware(gaMeasurementId) {
  const gtmDirectives = gaMeasurementId
    ? {
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
        imgSrc: ["'self'", 'data:', 'https://www.googletagmanager.com'],
        connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://www.googletagmanager.com'],
      }
    : {};

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", ...(gtmDirectives.scriptSrc || [])],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', ...(gtmDirectives.imgSrc || [])],
        connectSrc: ["'self'", ...(gtmDirectives.connectSrc || [])],
        // Third-party frames are otherwise disallowed; the privacy-preserving
        // youtube-nocookie origin is the single exception, for post video embeds.
        frameSrc: ["'self'", 'https://www.youtube-nocookie.com', ...(gaMeasurementId ? ['https://www.googletagmanager.com'] : [])],
      },
    },
  });
}

module.exports = securityMiddleware;
