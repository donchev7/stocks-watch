import 'jest-extended'
import faker from '@faker-js/faker'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

describe('handlers/delete-portfolio', () => {
  const portfolioName = `${faker.random.alphaNumeric(10)}`
  const mockDB = {
    deletePortfolio: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('should delete a portfolio', async () => {
    const req = testRequest()
    const handler = errorHandler(newHandler(mockDB), testReporter())
    const resp = (await handler(testContext({ name: portfolioName }), req)) as { status: number }

    expect(resp.status).toBe(204)
  })

  it('should not allow missing portfolioname', async () => {
    const req = testRequest()
    const handler = errorHandler(newHandler(mockDB), testReporter())
    const resp = (await handler(testContext(), req)) as {
      status: number
      body: { error: { reason: string } }
    }

    expect(resp.status).toBe(400)
    expect(resp.body.error.reason).toEqual('portfolioName is required')
  })
})
