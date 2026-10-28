describe('Configuration view', () => {
    beforeEach(() => {
        cy.stubBackend();
        cy.visit('/configuration');
        cy.wait('@categories');
    });

    it('renders the categories table and the database maintenance section', () => {
        cy.contains('Delete Category?').should('not.exist');
        cy.get('table tbody tr').should('have.length', 4);
        cy.contains('not_mapped').should('exist');
        cy.contains('Food').should('exist');
        cy.contains('Paycheck').should('exist');
        cy.contains('Database Maintenance').should('exist');
        cy.contains('button', 'Reset & Dump Seed Data').should('exist');
    });

    describe('filters', () => {
        it('filters by name', () => {
            cy.vTextField('Filter by Name', 'Food');
            cy.get('table tbody tr').should('have.length', 1);
        });

        it('filters by keyword', () => {
            cy.vTextField('Filter by Keyword', 'TINEX');
            cy.get('table tbody tr').should('have.length', 1);
            cy.contains('Food').should('exist');
        });

        it('filters by Wants/Needs (Wants)', () => {
            cy.vSelect('Wants/Needs', 'Wants');
            cy.get('table tbody tr').should('have.length', 1);
            cy.contains('Food').should('exist');
        });

        it('filters by Type (Income)', () => {
            cy.vSelect('Type', 'Income');
            cy.get('table tbody tr').should('have.length', 1);
            cy.contains('Paycheck').should('exist');
        });
    });

    describe('create category', () => {
        it('adds a new category through the dialog', () => {
            cy.clickButton('Add Category');
            cy.contains('.v-card-title', 'Add Category').should('exist');

            cy.vTextField('Category Name', 'Coffee');
            cy.get('.v-dialog').contains('Income').click();
            cy.vTextField('Add new keyword', 'COFFEE');
            cy.get('.v-dialog').contains('button', 'Add').click();
            cy.get('.v-dialog .keyword-input input').first().should('have.value', 'COFFEE');

            cy.get('.v-dialog').contains('button', 'Save').click();
            cy.wait('@addCategory');
            cy.wait('@categories');
            cy.contains('.v-card-title', 'Add Category').should('not.exist');
        });

        it('alerts when saving a category without a name', () => {
            cy.stubAlert();
            cy.clickButton('Add Category');
            cy.get('.v-dialog').contains('button', 'Save').click();
            cy.get('@alertStub').should('have.been.calledWith', 'Category must have a name.');
        });
    });

    describe('edit category', () => {
        it('opens the edit dialog for an existing category', () => {
            cy.contains('table tbody tr', 'Food').find('.v-btn').eq(0).click();
            cy.contains('.v-card-title', 'Edit Category').should('exist');
            cy.get('.v-dialog input').first().should('have.value', 'Food');
            cy.get('.v-dialog').contains('button', 'Cancel').click();
        });

        it('updates a category name and saves', () => {
            cy.contains('table tbody tr', 'Food').find('.v-btn').eq(0).click();
            cy.vTextField('Category Name', 'Food & Drinks');
            cy.get('.v-dialog').contains('button', 'Save').click();
            cy.wait('@updateCategory');
            cy.wait('@categories');
        });
    });

    describe('delete category', () => {
        it('deletes a category through the confirmation dialog', () => {
            cy.contains('table tbody tr', 'Paycheck').find('.v-btn').eq(1).click();
            cy.contains('.v-card-title', 'Delete Category?').should('exist');
            cy.get('.v-dialog').contains('button', 'Delete').click();
            cy.wait('@deleteCategory');
            cy.wait('@categories');
        });
    });

    describe('Reset & Dump', () => {
        it('wipes transactions/budgets and dumps the seed, alerting the result', () => {
            cy.stubAlert();
            cy.contains('button', 'Reset & Dump Seed Data').click();
            cy.contains('.v-card-title', 'Reset Database & Dump Seed Data?').should('exist');
            cy.get('.v-dialog').contains('button', 'Reset & Dump').click();
            cy.wait('@deleteAllTransactions');
            cy.wait('@deleteAllBudgets');
            cy.wait('@dump');
            cy.wait('@categories');
            cy.get('@alertStub').should('have.been.calledWithMatch', /Dumped 26 categories and 130 keywords/);
        });
    });
});