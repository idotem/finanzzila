import * as SQLite from 'expo-sqlite';

async function createDatabase() {
    const db = await SQLite.openDatabaseAsync('databaseName');

    // `execAsync()` is useful for bulk queries when you want to execute altogether.
    // Please note that `execAsync()` does not escape parameters and may lead to SQL injection.
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
    INSERT INTO test (value, intValue) VALUES ('test1', 123);
    INSERT INTO test (value, intValue) VALUES ('test2', 456);
    INSERT INTO test (value, intValue) VALUES ('test3', 789);
    `);
    const allRows = await db.getAllAsync('SELECT * FROM test');
    console.log(allRows);
    return allRows;
}

export default createDatabase;
