const app = require('./app');
const config = require('./config');
const { bootstrap } = require('./lib/bootstrap');

bootstrap(app)
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Website running at http://localhost:${config.port} (${config.nodeEnv})`);
    });
  })
  .catch((err) => {
    console.error('[FATAL] bootstrap failed - refusing to start:', err);
    process.exit(1);
  });
