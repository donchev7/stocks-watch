import 'jest-extended'
import faker from '@faker-js/faker'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

describe('handlers/get-portfolio', () => {
  const portfolioName = `${faker.random.alphaNumeric(10)}`
  const mockDB = {
    getPortfolio: jest.fn(),
    getAssets: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('should get a portfolio with assets', async () => {
    const req = testRequest()
    mockDB.getPortfolio.mockResolvedValue({
      createdAt: new Date(),
      name: portfolioName,
    })
    mockDB.getAssets.mockResolvedValue([
      {
        symbol: 'MSFT',
        price: 10,
        amount: 10,
        investmentValue: 100,
        lastPriceCheckValue: 100,
        lastMonthlyCheckValue: 100,
        currentValue: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    const handler = errorHandler(newHandler(mockDB), testReporter())
    const resp = (await handler(testContext({ name: portfolioName }), req)) as { status: number }

    expect(resp.status).toEqual(200)
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
