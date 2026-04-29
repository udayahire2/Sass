const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { env } = require('../config/env');
const { getDatabase } = require('../config/database');
const { hashPassword } = require('../utils/authTokens');
const { createTimestamps, get, run, splitName } = require('./dbService');

async function runMigrations() {
    const db = getDatabase();
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );
    `);

    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.up.sql'))
        .sort();

    const applied = new Set(
        db.prepare('SELECT name FROM schema_migrations ORDER BY name ASC').all().map((row) => row.name)
    );

    for (const file of files) {
        const name = file.replace('.up.sql', '');
        if (applied.has(name)) {
            continue;
        }

        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec('BEGIN');
        try {
            db.exec(sql);
            db.prepare(
                'INSERT INTO schema_migrations (id, name, created_at) VALUES (?, ?, ?)'
            ).run(crypto.randomUUID(), name, new Date().toISOString());
            db.exec('COMMIT');
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
    }
}

async function ensureDefaultAdmin() {
    await runMigrations();

    if (!env.adminEmail || !env.adminPassword) {
        return null;
    }

    const existing = get(
        `SELECT *
         FROM users
         WHERE email = ? AND deleted_at IS NULL`,
        [env.adminEmail.toLowerCase()]
    );

    if (existing) {
        return existing;
    }

    const passwordHash = await hashPassword(env.adminPassword);
    const nameParts = splitName(env.adminName);
    const timestamps = createTimestamps();

    run(
        `INSERT INTO users (
            id, first_name, last_name, email, password_hash, role, is_verified, is_approved,
            branch, academic_year, designation, department, college_name, avatar_url, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, 'admin', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?, NULL)`,
        [
            crypto.randomUUID(),
            nameParts.firstName,
            nameParts.lastName,
            env.adminEmail.toLowerCase(),
            passwordHash,
            timestamps.createdAt,
            timestamps.updatedAt,
        ]
    );

    return get(
        `SELECT *
         FROM users
         WHERE email = ? AND deleted_at IS NULL`,
        [env.adminEmail.toLowerCase()]
    );
}

module.exports = { ensureDefaultAdmin, runMigrations };
