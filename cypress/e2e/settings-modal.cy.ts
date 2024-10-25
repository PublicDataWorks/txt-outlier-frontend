describe('Settings Modal', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/broadcasts', {
      fixture: 'broadcasts.json'
    }).as('broadcasts')

    cy.intercept('GET', '**/lookup_context?*', {
      statusCode: 200,
      body: [
        { name: 'comment_summary_prompt', content: 'Test comment summary' },
        { name: 'impact_summary_prompt', content: 'Test impact summary' },
        { name: 'message_summary_prompt', content: 'Test message summary' }
      ]
    }).as('lookupContext')

    cy.intercept('PATCH', '**/lookup_context', {
      statusCode: 200
    }).as('updateLookupContext')

    cy.visit('/')
    cy.wait('@broadcasts')
  })

  it('opens settings modal when clicking settings button', () => {
    cy.contains('button', 'Settings').click()
    cy.contains('Edit Settings').should('be.visible')
    cy.contains('Comment Summary Prompt').should('be.visible')
    cy.contains('Impact Summary Prompt').should('be.visible')
    cy.contains('Message Summary Prompt').should('be.visible')
  })

  it('loads existing settings from lookup_context table', () => {
    cy.contains('button', 'Settings').click()
    cy.wait('@lookupContext')
    
    cy.get('textarea').should('have.length', 3)
    cy.contains('textarea', 'Test comment summary').should('exist')
    cy.contains('textarea', 'Test impact summary').should('exist')
    cy.contains('textarea', 'Test message summary').should('exist')
  })

  it('can update settings', () => {
    cy.contains('button', 'Settings').click()
    cy.wait('@lookupContext')

    // Update the first textarea
    cy.get('textarea').first()
      .clear()
      .type('Updated comment summary')

    cy.contains('button', 'Save').click()
    cy.wait('@updateLookupContext')

    // Modal should close after saving
    cy.contains('Edit Settings').should('not.exist')
  })

  it('can cancel without saving changes', () => {
    cy.contains('button', 'Settings').click()
    cy.wait('@lookupContext')

    // Make some changes
    cy.get('textarea').first()
      .clear()
      .type('Unsaved changes')

    cy.contains('button', 'Cancel').click()

    // Modal should close without saving
    cy.contains('Edit Settings').should('not.exist')
    cy.get('@updateLookupContext.all').should('have.length', 0)
  })
})
