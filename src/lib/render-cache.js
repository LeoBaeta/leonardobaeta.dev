'use strict';

const config = require('../config');

const cache = new Map();

module.exports = {
  get(slug) {
    return cache.get(slug);
  },

  set(slug, html) {
    if (cache.size >= config.maxCacheEntries) {
      // FIFO: remove the oldest (first-inserted) entry
      cache.delete(cache.keys().next().value);
    }
    cache.set(slug, html);
  },

  clear() {
    cache.clear();
  },

  get size() {
    return cache.size;
  },
};
