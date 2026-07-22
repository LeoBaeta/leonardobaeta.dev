require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  siteOgImage: process.env.SITE_OG_IMAGE || '',
  authorName: process.env.AUTHOR_NAME || 'Leonardo Baeta',
  authorBio: process.env.AUTHOR_BIO || '',
  authorGithub: process.env.AUTHOR_GITHUB || '',
  authorLinkedIn: process.env.AUTHOR_LINKEDIN || '',
  maxCacheEntries: parseInt(process.env.MAX_CACHE_ENTRIES, 10) || 200,
};

module.exports = config;
