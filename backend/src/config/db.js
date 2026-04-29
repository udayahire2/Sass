const { getDatabase } = require('./database');
const { runMigrations } = require('../services/bootstrapService');

async function connectDB() {
    await runMigrations();
    const db = getDatabase();
    console.log(`SQLite database ready at ${db.location || 'configured path'}`);
    return db;
}

module.exports = connectDB;
