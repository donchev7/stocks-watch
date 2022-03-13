import 'jest-extended'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

describe('handlers/search-symbol', () => {
  const mockAPI = {
    searchSymbol: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('should return matches for a symbol', async () => {
    const req = testRequest({
      query: {
        searchTerm: 'MSFT',
      },
    })
    mockAPI.searchSymbol.mockResolvedValue({
      matches: [
        {
          searchScore: '87',
          symbol: 'MSFT',
          name: 'Microsoft Corperation',
          type: 'NASDAQ',
          tradingCurrency: 'USD',
          market: 'US',
        },
      ],
    })
    const handler = errorHandler(newHandler(mockAPI), testReporter())
    const resp = (await handler(testContext(), req)) as { status: number }

    expect(resp.status).toEqual(200)
  })

  it('should return empty array matches for invalid symbol', async () => {
    const req = testRequest({
      query: {
        searchTerm: 'invalid',
      },
    })
    mockAPI.searchSymbol.mockResolvedValue({
      matches: [],
    })
    const handler = errorHandler(newHandler(mockAPI), testReporter())
    const resp = (await handler(testContext(), req)) as { status: number }

    expect(resp.status).toEqual(200)
  })

  it('should not allow missing searchTerm', async () => {
    const req = testRequest()
    const handler = errorHandler(newHandler(mockAPI), testReporter())
    const resp = (await handler(testContext(), req)) as { status: number; body: { error: { reason: string } } }

    expect(resp.status).toEqual(400)
    expect(resp.body.error.reason).toEqual('searchTerm is required')
  })
})
