import 'jest-extended'
import faker from '@faker-js/faker'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

describe('handlers/list-portfolios', () => {
  const portfolioName = `${faker.random.alphaNumeric(10)}`
  const mockDB = {
    listPortfolios: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('should list portfolios', async () => {
    const req = testRequest()
    mockDB.listPortfolios.mockResolvedValue({
      resources: [
        {
          name: portfolioName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    const handler = errorHandler(newHandler(mockDB), testReporter())

    const resp = (await handler(testContext(), req)) as { status: number }

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

    expect(mockDB.listPortfolios).toHaveBeenCalledWith(testContext().log, undefined, -10)
  })
})
