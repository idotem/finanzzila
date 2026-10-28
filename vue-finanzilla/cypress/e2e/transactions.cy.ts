describe('Transactions view', () => {
    beforeEach(() => {
        cy.stubBackend();
        cy.visit('/transactions');
        cy.wait('@categories');
        cy.wait('@transactions');
    });

    it('renders the data table and all filter/action controls', () => {
        cy.contains('Add Transaction').should('exist');
        cy.contains('.v-row', 'Add Transaction').contains('button', 'Delete All');
        cy.get('input[placeholder="Filter company name"]').should('exist');
        cy.contains('Choose Category Filter').should('exist');
        cy.contains('Total Amount Sum:').should('exist');
        cy.get('table tbody tr').should('have.length', 4);
        cy.contains('TINEX Market').should('exist');
        cy.contains('SALARY Inc').should('exist');
    });

    describe('filtering', () => {
        it('filters transactions by company name text', () => {
            cy.get('input[placeholder="Filter company name"]').clear().type('TINEX');
            cy.get('table tbody tr').should('have.length', 1);
            cy.contains('TINEX Market').should('exist');
            cy.get('input[placeholder="Filter company name"]').clear();
            cy.get('table tbody tr').should('have.length', 4);
        });

        it('apply a category filter via the Choose Category Filter select', () => {
            cy.vSelect('Choose Category Filter', 'Food');
            cy.contains('.v-field', 'Choose Category Filter').should('contain.text', 'Food');
        });
    });

    describe('add transaction validation', () => {
        function openAddDialog() {
            cy.clickButton('Add Transaction');
            cy.contains('.v-card-title', 'Add Transaction').should('exist');
        }

        it('alerts when required fields are missing', () => {
            cy.stubAlert();
            openAddDialog();
            cy.get('.v-dialog').contains('button', 'Save').click();
            cy.get('@alertStub').should('have.been.calledWith', 'Required fields for transaction are not filled.');
        });

        it('alerts when the amount sign is incompatible with the category type', () => {
            cy.stubAlert();
            openAddDialog();
            cy.vTextField('Company name', 'Some Move');
            cy.vTextField('Amount (MKD)', '100');
            cy.vSelect('Category', 'Food');
            pickDate();
            cy.get('.v-dialog').contains('button', 'Save').click();
            cy.get('@alertStub').should(
                'have.been.calledWith',
                'If amount is greater than 0, category MUST be Income, and if <= 0 it MUST be Expense. Saving Accounts can be either.'
            );
        });
    });

    describe('add transaction success', () => {
        it('creates a transaction and alerts on success', () => {
            cy.stubAlert();
            cy.clickButton('Add Transaction');
            cy.vTextField('Company name', 'New Coffee');
            cy.vTextField('Amount (MKD)', '-120');
            cy.vSelect('Category', 'Food');
            pickDate();
            cy.get('.v-dialog').contains('button', 'Save').click();
            cy.wait('@addTransaction');
            cy.get('@alertStub').should('have.been.called');
            cy.get('@alertStub').should('be.calledWithMatch', /Successfully added transaction/);
        });
    });

    describe('edit transaction', () => {
        it('opens the edit dialog prefilled and updates the transaction', () => {
            cy.get('table tbody tr').eq(0).find('.v-btn').eq(0).click();
            cy.contains('.v-card-title', 'Edit Transaction').should('exist');
            cy.vTextField('Company name', 'TINEX Edited');
            cy.get('.v-dialog').contains('button', 'Save').click();
            cy.wait('@updateTransaction');
            cy.contains('.v-card-title', 'Edit Transaction').should('not.exist');
        });
    });

    describe('delete transaction', () => {
        it('deletes one transaction through the confirmation dialog', () => {
            cy.get('table tbody tr').eq(0).find('.v-btn').eq(1).click();
            cy.contains('Are you sure you want to delete this transaction?').should('exist');
            cy.get('.v-dialog').contains('button', 'Delete').click();
            cy.wait('@deleteTransaction');
            cy.wait('@transactions');
        });
    });

    describe('bulk actions', () => {
        it('updates the category of selected transactions', () => {
            cy.get('table tbody tr').eq(0).find('input[type="checkbox"]').check({ force: true });
            cy.contains('1 item selected').should('exist');
            cy.vSelect('Update category to...', 'Food');
            cy.contains('button', 'Update Category').click();
            cy.wait('@bulkUpdateCategory');
        });

        it('deletes selected transactions via the bulk delete dialog', () => {
            cy.get('table tbody tr').eq(0).find('input[type="checkbox"]').check({ force: true });
            cy.get('table tbody tr').eq(3).find('input[type="checkbox"]').check({ force: true });
            cy.contains('2 items selected').should('exist');
            cy.contains('button', 'Delete Selected').click();
            cy.contains('Delete 2 selected transactions?').should('exist');
            cy.get('.v-dialog').contains('button', 'Delete All Selected').click();
            cy.wait('@bulkDelete');
            cy.wait('@transactions');
        });
    });

    describe('delete all transactions', () => {
        it('removes every transaction through the Delete All dialog', () => {
            cy.contains('.v-row', 'Add Transaction')
                .contains('button', 'Delete All')
                .click();
            cy.contains('Delete ALL transactions?').should('exist');
            cy.get('.v-dialog').contains('button', 'Delete Everything').click();
            cy.wait('@deleteAllTransactions');
            cy.wait('@transactions');
            cy.contains('No data available').should('exist');
        });
    });
});

function pickDate() {
    cy.get('.v-dialog .dp__input').click();
    cy.get('.v-dialog').contains('.dp__calendar_item', '8').click();
    // Dismiss the date picker popup so it does not cover the next controls.
    cy.get('.v-dialog .v-card-title').click();
}