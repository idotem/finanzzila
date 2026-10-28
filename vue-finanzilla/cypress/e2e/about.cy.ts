describe('About view', () => {
    beforeEach(() => {
        cy.stubBackend();
        cy.visit('/about');
    });

    it('shows the welcome heading and feature cards', () => {
        cy.contains('Welcome to Finanzzila').should('exist');
        cy.contains('Dashboard').should('exist');
        cy.contains('Transactions').should('exist');
        cy.contains('Reports & Charts').should('exist');
        cy.contains('Budget Planner').should('exist');
        cy.contains('Saving Accounts').should('exist');
        cy.contains('Custom Categories').should('exist');
    });

    it('renders the How it Works section with a pro tip mentioning NOT_MAPPED', () => {
        cy.contains('How it Works').should('exist');
        cy.contains('NOT_MAPPED').should('exist');
    });

    it('renders the multi-bank support section and configuration fields table', () => {
        cy.contains('Multi-Bank Support').should('exist');
        cy.contains('Komercijalna Banka').should('exist');
        cy.contains('NLB Banka').should('exist');
        cy.contains('table th', 'Field').should('exist');
        cy.contains('table td', 'bankName').should('exist');
        cy.contains('table td', 'hasSeparateIncomeExpense').should('exist');
    });
});