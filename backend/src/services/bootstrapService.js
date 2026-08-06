const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { env } = require('../config/env');
const { getDatabase } = require('../config/database');
const { hashPassword } = require('../utils/authTokens');
const { createTimestamps, get, run, splitName } = require('./dbService');

function ensureSyllabusTable(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS syllabus (
            id TEXT PRIMARY KEY,
            subject_id TEXT,
            title TEXT NOT NULL,
            code TEXT NOT NULL DEFAULT '',
            branch TEXT NOT NULL,
            semester TEXT NOT NULL DEFAULT '',
            academic_year TEXT,
            type TEXT NOT NULL DEFAULT 'pdf',
            credits INTEGER NOT NULL DEFAULT 0,
            content_url TEXT NOT NULL DEFAULT '',
            syllabus_type TEXT DEFAULT 'subject',
            program TEXT,
            subject_name TEXT,
            subject_code TEXT,
            semesters TEXT,
            description TEXT,
            topics TEXT,
            learning_outcomes TEXT,
            textbooks TEXT,
            assessment_scheme TEXT,
            references_list TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            deleted_at TEXT
        );
    `);

    const tableInfo = db.prepare("PRAGMA table_info(syllabus)").all();
    const existingColumns = new Set(tableInfo.map((col) => col.name));

    const columnsToAdd = [
        ['syllabus_type', "TEXT DEFAULT 'subject'"],
        ['program', 'TEXT'],
        ['subject_name', 'TEXT'],
        ['subject_code', 'TEXT'],
        ['semesters', 'TEXT'],
        ['description', 'TEXT'],
        ['topics', 'TEXT'],
        ['learning_outcomes', 'TEXT'],
        ['textbooks', 'TEXT'],
        ['assessment_scheme', 'TEXT'],
        ['references_list', 'TEXT'],
    ];

    for (const [colName, colDef] of columnsToAdd) {
        if (!existingColumns.has(colName)) {
            try {
                db.exec(`ALTER TABLE syllabus ADD COLUMN ${colName} ${colDef};`);
            } catch (e) {
                // column may already exist
            }
        }
    }
}

async function runMigrations() {
    const db = getDatabase();
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );
    `);

    ensureSyllabusTable(db);

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
    run('UPDATE users SET is_verified = 1 WHERE is_verified = 0');

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
