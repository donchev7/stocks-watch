import 'jest-extended'
import faker from '@faker-js/faker'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

describe('handlers/list-trades', () => {
  const portfolioName = `${faker.random.alphaNumeric(10)}`
  const mockDB = {
    listTrades: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('should list trades', async () => {
    const req = testRequest()
    mockDB.listTrades.mockResolvedValue({
      resources: [
        {
          symbol: 'MSFT',
          amount: 10,
          price: 10,
          value: 100,
          type: 'buy',
          createdAt: new Date().toISOString(),
        },
      ],
    })
    const handler = errorHandler(newHandler(mockDB), testReporter())
    const resp = (await handler(testContext(), req)) as { status: number }

    expect(resp.status).toEqual(200)
  })

  it('should list trades given a portfolioName', async () => {
    const req = testRequest({ query: { portfolioName } })
    mockDB.listTrades.mockResolvedValue({
      resources: [
        {
          symbol: 'MSFT',
          amount: 10,
          price: 10,
          value: 100,
          type: 'buy',
          createdAt: new Date().toISOString(),
        },
      ],
    })
    const handler = errorHandler(newHandler(mockDB), testReporter())
    const resp = (await handler(testContext(), req)) as { status: number }

    expect(mockDB.listTrades).toHaveBeenCalledWith(testContext().log, portfolioName, undefined, undefined)
    expect(resp.status).toEqual(200)
  })

  it('limit queryParameter should be transformed to number', async () => {
    const req = testRequest({
      query: {
        limit: '-10',
      },
    })
    const handler = errorHandler(newHandler(mockDB), testReporter())

    await handler(testContext(), req)

    expect(mockDB.listTrades).toHaveBeenCalledWith(testContext().log, undefined, undefined, -10)
  })
})
