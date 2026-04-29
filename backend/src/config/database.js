const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const { env } = require('./env');

let databaseInstance;

function getDatabase() {
    if (databaseInstance) {
        return databaseInstance;
    }

    const directory = path.dirname(env.dbPath);
    fs.mkdirSync(directory, { recursive: true });

    databaseInstance = new DatabaseSync(env.dbPath);
    databaseInstance.exec(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA busy_timeout = 5000;
    `);

    return databaseInstance;
}

module.exports = { getDatabase };
