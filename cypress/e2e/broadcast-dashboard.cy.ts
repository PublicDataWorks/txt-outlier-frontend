const BROADCAST_PATH = '**/broadcasts'
describe('Broadcasts', () => {
  beforeEach(() => {
    cy.seed()
  })

  it('visits the dashboard', () => {
    cy.seed()
    cy.get('[data-cy="most-recent"]').should('include.text', 'Most recent batch sent on Wed Jan 31, 2:30 PM GMT+0')
    cy.contains('Total conversation starters sent: 120')
    cy.contains('Delivered successfully: 230')
    cy.contains('Failed to deliver: 2')

    cy.contains('Next batch scheduled to send on Sun Oct 10, 4:16 PM GMT+0')
    cy.contains('this is the first messages in test')
    cy.contains('this is the follow-up messages in test')
  })

  it('edit first message of far future', () => {
    cy.contains('Edit conversation starter').should('not.exist')
    cy.contains('Note: these updates will apply to all future batches.').should('not.exist')

    cy.get('[data-cy="edit-first-message"]').click()

    cy.contains('Edit conversation starter')
    cy.contains('Note: these updates will apply to all future batches.')
    cy.contains('button', 'Save changes').should('be.disabled')

    cy.get('[name="firstMessage"]').clear().type('test first message')
    cy.contains('button', 'Save changes').should('be.enabled')
    cy.intercept(
      { method: 'PATCH', url: `${BROADCAST_PATH}/35` },
      {
        statusCode: 200,
        statusMessage: 'Success'
      }
    ).as('updateBroadcast')

    cy.contains('button', 'Save changes').click()
    cy.wait('@updateBroadcast').its('request.method').should('eq', 'PATCH')
    cy.contains('Edit conversation starter').should('not.exist')
  })

  it('edit first message of less than 90 minutes', () => {
    cy.fixture('broadcasts.json').then(dashboard => {
      dashboard.upcoming.runAt = Math.floor(Date.now() / 1000) + 30 * 60
      cy.intercept('GET', BROADCAST_PATH, dashboard)
    })
    cy.reload()
    cy.contains(
      "The next batch is scheduled to send less than 90 minutes from now. Making these message updates will delay today's batch by 2-3 hours, sending at approximately"
    ).should('not.exist')

    cy.get('[data-cy="edit-first-message"]').click()
    cy.contains(
      "The next batch is scheduled to send less than 90 minutes from now. Making these message updates will delay today's batch by 2-3 hours, sending at approximately"
    )
    cy.contains('button', 'Save changes and delay the next batch').should('be.disabled')
  })

  it('edit follow-up message of far future', () => {
    cy.contains('Edit follow-up message').should('not.exist')
    cy.contains(
      'Note: these updates will apply to all future batches. Follow-up messages are sent after the conversation starter, only if the recipient does not reply to the starter message.'
    ).should('not.exist')

    cy.get('.data-edit-second-message').click()

    cy.contains('Edit follow-up message')
    cy.contains(
      'Note: these updates will apply to all future batches. Follow-up messages are sent after the conversation starter, only if the recipient does not reply to the starter message.'
    )
    cy.contains('button', 'Save changes').should('be.disabled')

    cy.get('[name="secondMessage"]').clear().type('test follow-up message')
    cy.contains('button', 'Save changes').should('be.enabled')

    cy.intercept(
      { method: 'PATCH', url: `${BROADCAST_PATH}/35` },
      {
        statusCode: 200,
        statusMessage: 'Success'
      }
    ).as('updateBroadcast')

    cy.contains('button', 'Save changes').click()
    cy.wait('@updateBroadcast').its('request.method').should('eq', 'PATCH')
    cy.contains('Edit follow-up message').should('not.exist')
  })

  it('edit first message of less than 90 minutes', () => {
    cy.fixture('broadcasts.json').then(dashboard => {
      console.log(dashboard.upcoming.runAt)
      dashboard.upcoming.runAt = Math.floor(Date.now() / 1000) + 30 * 60
      cy.intercept('GET', BROADCAST_PATH, dashboard)
    })
    cy.reload()
    cy.contains(
      "The next batch is scheduled to send less than 90 minutes from now. Making these message updates will delay today's batch by 2-3 hours, sending at approximately"
    ).should('not.exist')
    cy.contains(
      'Note: follow-up messages are sent after the conversation starter, only if the recipient does not reply to the starter message. '
    ).should('not.exist')

    cy.get('.data-edit-second-message').click()
    cy.contains(
      "The next batch is scheduled to send less than 90 minutes from now. Making these message updates will delay today's batch by 2-3 hours, sending at approximately"
    )
    cy.contains(
      'Note: follow-up messages are sent after the conversation starter, only if the recipient does not reply to the starter message.'
    )
    cy.contains('button', 'Save changes and delay the next batch').should('be.disabled')
  })
})
