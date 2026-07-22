module.exports = {
  apps: [{
    name: 'leonardobaeta-dev',
    script: 'src/server.js',
    cwd: '/opt/leonardobaeta.dev',   // explicit - never implicit shell cwd
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '256M',
    out_file: '/var/log/leonardobaeta-dev/out.log',
    error_file: '/var/log/leonardobaeta-dev/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    env: { NODE_ENV: 'production', PORT: 3000, MAX_CACHE_ENTRIES: 200 },
    env_development: { NODE_ENV: 'development', PORT: 3001 }
  }]
};
