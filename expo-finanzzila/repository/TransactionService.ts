import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { transaction } from '@/db/schema';

const expo = SQLite.openDatabaseSync('finanzzila.db');
const db = drizzle(expo);

export class TransactionService {
    static async findAll() {
        return await db.select().from(transaction);
    }

    static async create() {
        return await db.insert(transaction).values({
            nameOfPlace: 'TEST ',
            amount: 200,
            date: '2022-30-06',
            categoryId: 1,
            manualOverride: false,
        });
    }
}
