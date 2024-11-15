// import * as SQLite from 'expo-sqlite';

async function createDatabase() {}
export default createDatabase;
// async function initializeDatabase() {
//     const db = await SQLite.openDatabaseAsync('finanzzila');

//     // `execAsync()` is useful for bulk queries when you want to execute altogether.
//     // Please note that `execAsync()` does not escape parameters and may lead to SQL injection.
//     await db.execAsync(`
//         PRAGMA journal_mode = WAL;
//         CREATE TABLE IF NOT EXISTS category (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL
//     );

//     INSERT INTO category(name) VALUES ('TEST CAT');
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS 'transaction' (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             amount INTEGER NOT NULL,
//             date DATE NOT NULL,
//             name_of_place TEXT NOT NULL,
//             category_id INTEGER NOT NULL,
//             manual_override BOOLEAN DEFAULT FALSE,
//             FOREIGN KEY (category_id) REFERENCES category(id)
//         );
//         INSERT INTO 'transaction' (amount, date, name_of_place, category_id) VALUES (1000, '2024-29-06', 'TEST TEST TEST', 1);
//        `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS keyword (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             value TEXT NOT NULL,
//             category_id INTEGER NOT NULL,
//             FOREIGN KEY (category_id) REFERENCES category(id)
//         );
//         INSERT INTO keyword(value, category_id) VALUES ('TEST KEYWORD_CAT', 1);
//        `);
// }

// export default initializeDatabase;
