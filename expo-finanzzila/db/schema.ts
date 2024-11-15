import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const category = sqliteTable(
    'category',
    {
        id: integer('id', { mode: 'number' }).primaryKey({
            autoIncrement: true,
        }),
        name: text('name', { length: 256 }),
    },
    (category) => ({
        nameIdx: index('name_idx').on(category.name),
    }),
);

export const transaction = sqliteTable('transaction', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    nameOfPlace: text('name_of_place', { length: 256 }).notNull(),
    categoryId: integer('category_id')
        .references(() => category.id)
        .notNull(),
    amount: integer('amount').notNull(),
    date: text('date').notNull(),
    color: text('color').default('#FFFF00'),
    manualOverride: integer('manual_override', { mode: 'boolean' }).default(
        false,
    ),
});

export const keyword = sqliteTable('keyword', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    value: text('value', { length: 256 }).notNull(),
    categoryId: integer('category_id')
        .references(() => category.id)
        .notNull(),
});
