/// <reference types="cypress" />

const API = 'http://localhost:3000';

export const banks = ['KOMERCIJALNA BANKA', 'NLB BANKA'];

export const categories: any[] = [
    {
        id: 1,
        name: 'not_mapped',
        isWants: null,
        color: '#9e9e9e',
        type: 'EXPENSE',
        keywords: []
    },
    {
        id: 2,
        name: 'Food',
        isWants: 1,
        color: '#ef5350',
        type: 'EXPENSE',
        keywords: [
            { id: 10, value: 'TINEX' },
            { id: 11, value: 'LIDL' }
        ]
    },
    {
        id: 12,
        name: 'Paycheck',
        isWants: null,
        color: '#66bb6a',
        type: 'INCOME',
        keywords: [{ id: 20, value: 'SALARY' }]
    },
    {
        id: 20,
        name: 'Saving Account',
        isWants: null,
        color: '#42a5f5',
        type: 'SAVING_ACCOUNT',
        keywords: [{ id: 30, value: 'SAVE' }]
    }
];

export const cat = (id: number) => {
    const c = categories.find((c) => c.id === id)!;
    return { id: c.id, name: c.name, isWants: c.isWants, color: c.color, type: c.type };
};

export const initialTransactions: any[] = [
    { id: 1, date: '2026-07-01', nameOfPlace: 'TINEX Market', amount: -1500, category: cat(2) },
    { id: 2, date: '2026-07-03', nameOfPlace: 'SALARY Inc', amount: 50000, category: cat(12) },
    { id: 3, date: '2026-07-05', nameOfPlace: 'SAVE deposit', amount: 5000, category: cat(20) },
    { id: 4, date: '2026-07-06', nameOfPlace: 'Unknown shop', amount: -200, category: cat(1) }
];

export const initialBudgets: any[] = [
    { id: 1, month: '2026-06', amount: 1000, category: cat(2) },
    { id: 2, month: '2026-06', amount: 2000, category: cat(12) }
];

let transactionsStore: any[] = [...initialTransactions];
let budgetsStore: any[] = [...initialBudgets];

Cypress.Commands.add('stubBackend', () => {
    transactionsStore = [...initialTransactions];
    budgetsStore = [...initialBudgets];

    cy.intercept('GET', `${API}/banks`, banks).as('banks');
    cy.intercept('GET', `${API}/categories`, categories).as('categories');
    cy.intercept('GET', `${API}/transactions`, (req) => {
        let result = [...transactionsStore];
        const categoryId = req.query.categoryId;
        if (categoryId) {
            result = result.filter((t) => String(t.category?.id) === String(categoryId));
        }
        const dateFrom = req.query.dateFrom as string | undefined;
        const dateTo = req.query.dateTo as string | undefined;
        if (dateFrom) {
            const from = new Date(dateFrom);
            result = result.filter((t) => new Date(t.date) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            result = result.filter((t) => new Date(t.date) <= to);
        }
        req.reply(result);
    }).as('transactions');

    cy.intercept('POST', `${API}/transactions`, (req) => {
        const body = req.body;
        const created = {
            id: 999,
            date: body.date,
            nameOfPlace: body.nameOfPlace,
            amount: body.amount,
            category: cat(body.category)
        };
        transactionsStore.push(created);
        req.reply({ statusCode: 201, body: created });
    }).as('addTransaction');
    cy.intercept('POST', `${API}/transactions/upload`, (req) => {
        transactionsStore = [...initialTransactions];
        req.reply(transactionsStore);
    }).as('uploadTransactions');
    cy.intercept('POST', `${API}/transactions/bulk-delete`, (req) => {
        const ids: number[] = req.body.ids || [];
        transactionsStore = transactionsStore.filter((t) => !ids.includes(t.id));
        req.reply({ statusCode: 200, body: {} });
    }).as('bulkDelete');
    cy.intercept('POST', `${API}/transactions/bulk-update-category`, (req) => {
        const { ids, categoryId } = req.body;
        transactionsStore = transactionsStore.map((t) =>
            ids.includes(t.id) ? { ...t, category: cat(categoryId) } : t
        );
        req.reply({ statusCode: 200, body: {} });
    }).as('bulkUpdateCategory');
    cy.intercept('PUT', `${API}/transactions/*`, (req) => {
        req.reply(req.body);
    }).as('updateTransaction');
    // Register specific delete path AFTER the generic one so it wins precedence.
    cy.intercept('DELETE', `${API}/transactions/*`, (req) => {
        const id = Number(req.url.split('?')[0].split('/').pop());
        transactionsStore = transactionsStore.filter((t) => t.id !== id);
        req.reply({ statusCode: 200, body: {} });
    }).as('deleteTransaction');
    cy.intercept('DELETE', `${API}/transactions/delete-all`, (req) => {
        transactionsStore = [];
        req.reply({ statusCode: 200, body: {} });
    }).as('deleteAllTransactions');

    cy.intercept('POST', `${API}/categories`, (req) => {
        req.reply({ statusCode: 201, body: { ...req.body, id: 555 } });
    }).as('addCategory');
    cy.intercept('PUT', `${API}/categories/*`, (req) => req.reply(req.body)).as('updateCategory');
    cy.intercept('DELETE', `${API}/categories/*`, { statusCode: 200, body: {} }).as(
        'deleteCategory'
    );

    cy.intercept('GET', `${API}/budgets`, (req) => req.reply(budgetsStore)).as('allBudgets');
    cy.intercept('GET', `${API}/budgets/*`, (req) => {
        const month = req.url.split('?')[0].split('/').pop();
        req.reply(budgetsStore.filter((b) => b.month === month));
    }).as('budgetsByMonth');
    cy.intercept('POST', `${API}/budgets`, (req) => {
        const incoming: any[] = Array.isArray(req.body) ? req.body : [req.body];
        incoming.forEach((b, i) => {
            const existing = budgetsStore.find((x) => x.month === b.month && x.category?.id === b.categoryId);
            if (existing) {
                existing.amount = b.amount;
            } else {
                budgetsStore.push({
                    id: 1000 + i,
                    month: b.month,
                    amount: b.amount,
                    category: cat(b.categoryId)
                });
            }
        });
        req.reply(req.body);
    }).as('saveBudgets');
    // Specific month delete AFTER the generic budgets/*? generic budgets delete is /budgets (no segment) and /budgets/month/* — register month after allBudgets delete.
    cy.intercept('DELETE', `${API}/budgets/month/*`, (req) => {
        const month = req.url.split('?')[0].split('/').pop();
        budgetsStore = budgetsStore.filter((b) => b.month !== month);
        req.reply({ statusCode: 200, body: {} });
    }).as('deleteBudgetsByMonth');
    cy.intercept('DELETE', `${API}/budgets`, (req) => {
        budgetsStore = [];
        req.reply({ statusCode: 200, body: {} });
    }).as('deleteAllBudgets');

    cy.intercept('POST', `${API}/database/dump`, {
        statusCode: 200,
        body: {
            path: '/home/me/finanzzila-nestjs/database-dump.txt',
            categoriesCount: 26,
            keywordsCount: 130
        }
    }).as('dump');
});

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findField(label: string): Cypress.Chainable<any> {
    return cy
        .contains('.v-field-label', new RegExp(`^${escapeRegex(label)}$`))
        .closest('.v-field');
}

// Vuetify VTextField/VTextarea helper: clear and type into the field with the given label.
Cypress.Commands.add('vTextField', (label: string, text: string) => {
    findField(label).within(() => {
        cy.get('input,textarea').clear({ force: true });
        cy.get('input,textarea').type(text, { force: true });
    });
});

// Vuetify VSelect helper: open the field and pick an option by its visible title text.
Cypress.Commands.add('vSelect', (label: string, option: string) => {
    findField(label).find('.v-field__input').click({ force: true });
    cy.contains('.v-overlay--active .v-list-item', option).click({ force: true });
});

Cypress.Commands.add('clickButton', (text: string) => {
    cy.contains('button:not(:disabled)', text).click({ force: true });
});

Cypress.Commands.add('stubAlert', () => {
    const stub = cy.stub();
    cy.on('window:alert', stub);
    cy.wrap(stub).as('alertStub');
});

declare global {
    namespace Cypress {
        interface Chainable {
            stubBackend(): Chainable<void>;
            vTextField(label: string, text: string): Chainable<void>;
            vSelect(label: string, option: string): Chainable<void>;
            clickButton(text: string): Chainable<void>;
            stubAlert(): Cypress.Agent<sinon.SinonStub>;
        }
    }
}