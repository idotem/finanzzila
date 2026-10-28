describe('App shell & navigation', () => {
    beforeEach(() => {
        cy.stubBackend();
        cy.visit('/');
    });

    it('shows the app title and default dark theme icon', () => {
        cy.get('.v-app-bar').contains('Finanzzila').should('exist');
        cy.get('.v-app-bar').contains('light_mode').should('exist');
    });

    it('toggles the theme between dark and light', () => {
        cy.get('.v-app-bar').contains('light_mode').click();
        cy.get('.v-app-bar').contains('dark_mode').should('exist');

        cy.get('.v-app-bar').contains('dark_mode').click();
        cy.get('.v-app-bar').contains('light_mode').should('exist');
    });

    it('navigates to every page via the rail nav items', () => {
        cy.contains('.v-list-item', 'Transactions').click({ force: true });
        cy.location('pathname').should('eq', '/transactions');

        cy.contains('.v-list-item', 'Config').click({ force: true });
        cy.location('pathname').should('eq', '/configuration');

        cy.contains('.v-list-item', 'About').click({ force: true });
        cy.location('pathname').should('eq', '/about');

        cy.contains('.v-list-item', 'Dashboard').click({ force: true });
        cy.location('pathname').should('eq', '/');
    });

    it('directly loads each routed view by URL', () => {
        cy.visit('/transactions');
        cy.location('pathname').should('eq', '/transactions');
        cy.visit('/configuration');
        cy.location('pathname').should('eq', '/configuration');
        cy.visit('/about');
        cy.location('pathname').should('eq', '/about');
    });
});