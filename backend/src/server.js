const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const { cache } = require('./config/cache');
const { env } = require('./config/env');
const app = require('./app');
const { ensureDefaultAdmin, runMigrations } = require('./services/bootstrapService');

let server;

async function startServer() {
    await runMigrations();
    await ensureDefaultAdmin();
    await cache.connect();

    server = app.listen(env.port, () => {
        console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    if (server) {
        server.close(() => process.exit(1));
        return;
    }

    process.exit(1);
});
