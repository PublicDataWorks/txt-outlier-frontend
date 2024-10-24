const BROADCAST_PATH = '**/broadcasts'
describe('Broadcasts', () => {
  it('visits the dashboard', () => {
    cy.intercept('GET', '**/broadcasts', {
      fixture: 'broadcasts.json'
    }).as('seed')
    cy.visit('/')

    cy.wait('@seed')
    cy.contains('Next batch')
    cy.contains('Scheduled for')
    cy.contains('Sun Oct 10, 4:16 PM UTC')
    cy.contains('this is the first messages in test')
    cy.contains('this is the follow-up messages in test')

    cy.get('[data-cy="most-recent"]').within(() => {
      cy.contains('Last batch')
      cy.contains('Sent on Wed Jan 31, 2:30 PM UTC')
      cy.get('ul').within(() => {
        cy.get('li').each($li => {
          const text = $li.text()
          if (text.includes('Conversation starters sent')) {
            cy.wrap($li).contains('120')
          } else if (text.includes('Follow-up messages sent')) {
            cy.wrap($li).contains('0')
          } else if (text.includes('Total delivered successfully')) {
            cy.wrap($li).contains('230')
          } else if (text.includes('Failed to deliver')) {
            cy.wrap($li).contains('2')
          }
        })
      })
    })
  })

  it('opens the settings modal', () => {
    cy.contains('Settings').click()
    cy.contains('Edit Settings')
    cy.contains('Field 1')
    cy.contains('Field 2')
    cy.contains('Field 3')
    cy.contains('Save')
    cy.contains('Cancel')
  })

  it('verifies the text boxes in the settings modal', () => {
    cy.contains('Settings').click()
    cy.get('input[placeholder="Field 1"]').should('exist')
    cy.get('input[placeholder="Field 2"]').should('exist')
    cy.get('input[placeholder="Field 3"]').should('exist')
  })

  it('saves changes in the settings modal', () => {
    cy.contains('Settings').click()
    cy.get('input[placeholder="Field 1"]').type('New value 1')
    cy.get('input[placeholder="Field 2"]').type('New value 2')
    cy.get('input[placeholder="Field 3"]').type('New value 3')
    cy.contains('Save').click()
    cy.contains('Edit Settings').should('not.exist')
  })

  it('cancels changes in the settings modal', () => {
    cy.contains('Settings').click()
    cy.contains('Cancel').click()
    cy.contains('Edit Settings').should('not.exist')
  })
})
