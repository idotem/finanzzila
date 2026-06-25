'use strict';

/**
 * Import seed data from `database-dump.txt` into `finanzzila.db`.
 *
 * Source of truth for the seed is the committed `database-dump.txt` (a plain,
 * diffable text file produced by the `POST /database/dump` endpoint / the
 * "Reset & Dump Seed Data" button in the Configuration page). The binary
 * `finanzzila.db` is gitignored and is rebuilt from that dump on first install.
 *
 * Behaviour:
 *  - Creates the `category` and `keyword` tables (CREATE IF NOT EXISTS) using
 *    the same DDL TypeORM generates, so `synchronize: true` is a no-op for
 *    these two tables on first server start.
 *  - Only inserts the seed data when the `category` table is empty, so running
 *    it again on an already-populated DB (e.g. on a developer's machine with
 *    real transactions) is safe and does nothing.
 *  - Preserves explicit category and keyword ids so the keyword -> category
 *    references line up. SQLite's AUTOINCREMENT mechanism keeps
 *    `sqlite_sequence` at max(used id) after explicit-id inserts.
 *
 * Invoked from the root `postinstall` script after the backend dependencies
 * are installed.
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const BE_ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(BE_ROOT, 'finanzzila.db');
const DUMP_PATH = path.join(BE_ROOT, 'database-dump.txt');

const CATEGORY_DDL = `CREATE TABLE IF NOT EXISTS "category" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "name" varchar NOT NULL,
    "isWants" integer,
    "color" varchar,
    "type" varchar NOT NULL DEFAULT ('EXPENSE'),
    CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name")
)`;

const KEYWORD_DDL = `CREATE TABLE IF NOT EXISTS "keyword" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "value" varchar(200) NOT NULL,
    "category_id" integer NOT NULL,
    CONSTRAINT "UQ_918c4b88e9e9fc8443f2af2aa30" UNIQUE ("value"),
    CONSTRAINT "FK_815901283c48a6aa25fc5554aa3" FOREIGN KEY ("category_id") REFERENCES "category" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
)`;

const KEYWORD_INDEX_DDL =
    'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_de61276c92c1733514bc86a145" ON "keyword" ("category_id", "value")';

function fail(msg, err) {
    console.error(`[seed] ${msg}`, err || '');
    process.exit(1);
}

if (!fs.existsSync(DUMP_PATH)) {
    console.log(`[seed] No dump file at ${DUMP_PATH} — skipping import.`);
    process.exit(0);
}

let dump;
try {
    dump = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'));
} catch (err) {
    return fail(`Could not parse ${DUMP_PATH}.`, err);
}

const categories = (dump.categories || []).filter((c) => c && c.id != null);
const keywords = (dump.keywords || []).filter((k) => k && k.id != null);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) return fail('Failed to open database at ' + DB_PATH, err);

    db.serialize(() => {
        db.run(CATEGORY_DDL);
        db.run(KEYWORD_DDL);
        db.run(KEYWORD_INDEX_DDL);

        db.get('SELECT COUNT(*) AS c FROM category', (err, row) => {
            if (err) return fail('Could not count categories.', err);

            if (row.c > 0) {
                console.log(`[seed] Database already has ${row.c} categories, skipping import.`);
                return db.close();
            }

            seedData();
        });
    });
});

function seedData() {
    db.serialize(() => {
    db.run('BEGIN TRANSACTION');
        const catStmt = db.prepare(
            'INSERT INTO category (id, name, isWants, color, type) VALUES (?, ?, ?, ?, ?)'
        );
        for (const c of categories) {
            catStmt.run(c.id, c.name, c.isWants, c.color, c.type);
        }
        catStmt.finalize();

        const kwStmt = db.prepare(
            'INSERT INTO keyword (id, value, category_id) VALUES (?, ?, ?)'
        );
        for (const k of keywords) {
            kwStmt.run(k.id, k.value, k.categoryId);
        }
        kwStmt.finalize();

        db.run('COMMIT', (err) => {
            if (err) return fail('Failed to commit seed transaction.', err);
            console.log(
                `[seed] Imported ${categories.length} categories and ${keywords.length} keywords from ${path.basename(DUMP_PATH)}.`
            );
            db.close();
        });
    });
}