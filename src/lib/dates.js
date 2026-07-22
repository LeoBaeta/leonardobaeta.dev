'use strict';

function formatDisplayDate(isoString) {
  // Parse as local date (not UTC) to avoid timezone-offset day shifts.
  // new Date('YYYY-MM-DD') parses as UTC midnight; using the 3-arg constructor
  // keeps the intended calendar day regardless of the server's timezone.
  const [y, m, d] = String(isoString).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }); // -> "3 April 2026"
}

function formatISODate(isoString) {
  return isoString; // ISO 8601 as-is for sitemap
}

function formatRSSDate(isoString) {
  return new Date(isoString).toUTCString(); // RFC 822 for RSS
}

function compareDescending(a, b) {
  return new Date(b.date) - new Date(a.date);
}

module.exports = { formatDisplayDate, formatISODate, formatRSSDate, compareDescending };
