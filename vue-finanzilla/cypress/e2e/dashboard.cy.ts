describe('Dashboard view', () => {
    beforeEach(() => {
        cy.stubBackend();
        cy.visit('/');
        cy.wait('@categories');
        cy.wait('@transactions');
        cy.wait('@banks');
    });

    it('renders core sections after data loads', () => {
        cy.contains('Current Account Balance').should('exist');
        cy.contains('Transaction Summary').should('exist');
        cy.contains('Import Transactions').should('exist');
        cy.get('#barChart').should('exist');
        cy.get('.saving-account-item').should('exist');
        cy.contains('Saving Account').should('exist');
        cy.contains('Total Earned').should('exist');
        cy.contains('Total Spent').should('exist');
        cy.contains('Net Difference').should('exist');
        cy.contains('Smart Budget Planner').should('exist');
        cy.contains('Saved Budgets').should('exist');
    });

    it('navigates to the Transactions view when clicking a saving account row', () => {
        cy.get('.saving-account-item').first().click();
        cy.location('pathname').should('eq', '/transactions');
        cy.location('search').should('include', 'categoryId=20');
    });

    describe('Import Transactions dialog', () => {
        it('opens the dialog and disables Upload until a file is selected', () => {
            cy.clickButton('Import Transactions');
            cy.contains('.v-card-title', 'Import Transactions').should('exist');
            cy.contains('button', 'Upload').should('be.disabled');

            cy.contains('button', 'Cancel').click();
            cy.contains('.v-card-title', 'Import Transactions').should('not.exist');
        });

        it('selects a bank, picks a file and uploads successfully', () => {
            cy.clickButton('Import Transactions');
            cy.vSelect('Select Bank', 'NLB BANKA');

            cy.get('input[type="file"]').selectFile({
                contents: Cypress.Buffer.from('fake-xlsx'),
                fileName: 'statement.xlsx',
                mimeType:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            cy.contains('button', 'Upload').should('not.be.disabled');
            cy.contains('button', 'Upload').click();
            cy.wait('@uploadTransactions');
            cy.contains('.v-card-title', 'Import Transactions').should('not.exist');
        });
    });

    describe('Smart Budget Planner', () => {
        it('creates default suggestions and saves the budget for the selected month', () => {
            cy.contains('Smart Budget Planner').should('exist');
            cy.get('input[type="month"]').should('not.have.value', '');

            cy.contains('button', 'Save Budget').click();
            cy.wait('@saveBudgets');
            cy.get('.v-alert').contains(/Successfully saved budget for/).should('exist');
        });
    });

    describe('Saved Budgets list', () => {
        it('loads saved budgets grouped by month', () => {
            cy.contains('Saved Budgets');
            cy.contains('.v-card', 'Saved Budgets').should('contain.text', 'June 2026');
        });

        it('expands a month row to reveal its budgets', () => {
            cy.contains('.v-card', 'Saved Budgets')
                .contains('June 2026')
                .click();
            cy.contains('.v-card', 'Saved Budgets').contains('Food').should('exist');
        });

        it('deletes a month via the Delete button and confirmation', () => {
            cy.contains('.v-card', 'Saved Budgets')
                .find('.cursor-pointer')
                .first()
                .contains('button', 'Delete')
                .click();
            cy.contains('.v-card-title', 'Delete Budget Month').should('exist');
            cy.get('.v-dialog')
                .contains('button', 'Delete')
                .click();
            cy.wait('@deleteBudgetsByMonth');
            cy.wait('@allBudgets');
            cy.contains('No saved budgets yet.').should('exist');
        });

        it('deletes all budgets via the Delete All button', () => {
            cy.contains('.v-card', 'Saved Budgets')
                .contains('button', 'Delete All')
                .click();
            cy.contains('.v-card-title', 'Delete All Budgets').should('exist');
            cy.get('.v-dialog .v-card')
                .contains('button', 'Delete All')
                .click();
            cy.wait('@deleteAllBudgets');
            cy.wait('@allBudgets');
            cy.contains('No saved budgets yet.').should('exist');
        });
    });
});