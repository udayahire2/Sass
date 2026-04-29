const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { getDatabase } = require('../src/config/database');

const migrationsDir = path.join(__dirname, '../migrations');

function getMigrationFiles(direction) {
    const suffix = direction === 'down' ? '.down.sql' : '.up.sql';

    return fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(suffix))
        .sort();
}

function ensureMigrationsTable(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );
    `);
}

function runUp(db) {
    const files = getMigrationFiles('up');
    const applied = new Set(
        db.prepare('SELECT name FROM schema_migrations ORDER BY name ASC').all().map((row) => row.name)
    );

    for (const file of files) {
        const migrationName = file.replace('.up.sql', '');
        if (applied.has(migrationName)) {
            continue;
        }

        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec('BEGIN');
        try {
            db.exec(sql);
            db.prepare(
                'INSERT INTO schema_migrations (id, name, created_at) VALUES (?, ?, ?)'
            ).run(crypto.randomUUID(), migrationName, new Date().toISOString());
            db.exec('COMMIT');
            console.log(`Applied migration ${migrationName}`);
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
    }
}

function runDown(db) {
    const lastMigration = db
        .prepare('SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1')
        .get();

    if (!lastMigration) {
        console.log('No migrations to roll back');
        return;
    }

    const fileName = `${lastMigration.name}.down.sql`;
    const filePath = path.join(migrationsDir, fileName);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing down migration for ${lastMigration.name}`);
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    db.exec('BEGIN');
    try {
        db.exec(sql);
        db.prepare('DELETE FROM schema_migrations WHERE name = ?').run(lastMigration.name);
        db.exec('COMMIT');
        console.log(`Rolled back migration ${lastMigration.name}`);
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
}

function main() {
    const direction = process.argv[2] || 'up';
    if (!['up', 'down'].includes(direction)) {
        throw new Error(`Unsupported migration direction "${direction}"`);
    }

    const db = getDatabase();
    ensureMigrationsTable(db);

    if (direction === 'up') {
        runUp(db);
        return;
    }

    runDown(db);
}

main();
