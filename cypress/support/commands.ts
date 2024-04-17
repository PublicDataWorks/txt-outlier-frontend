import '@testing-library/cypress/add-commands'

Cypress.Commands.add('seed', () => {
  cy.intercept('GET', 'http://localhost:8000/functions/v1/backend/broadcasts', {
    fixture: 'broadcasts.json'
  }).as('seed')
  cy.visit('/')
  cy.wait('@seed')
})
