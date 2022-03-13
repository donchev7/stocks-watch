import 'jest-extended'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'
import { fakePortfolio } from '../../helpers/test-data'

describe('handlers/list-portfolios', () => {
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
      resources: [fakePortfolio()],
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
