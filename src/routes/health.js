const express = require('express');
const router = express.Router();

// Deploy pipeline gates on this returning 200 (PM2 "online" is not sufficient).
router.get('/healthz', (req, res) => {
  const index = req.app.locals.index;
  if (!index) return res.status(503).json({ status: 'starting' });
  res.json({ status: 'ok', posts: index.size });
});

module.exports = router;
