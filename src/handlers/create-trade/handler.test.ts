import 'jest-extended'
import { faker } from '@faker-js/faker'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

describe('handlers/create-trade', () => {
  const portfolioName = `${faker.random.alphaNumeric(10)}`
  const mockTrade = {
    saveTrade: jest.fn(),
  }
  const mockQuote = {
    symbolExists: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('should create a trade', async () => {
    const req = testRequest({
      body: { portfolioName: portfolioName, symbol: 'MSFT', amount: 10, price: 10, type: 'buy' },
    })
    mockTrade.saveTrade.mockResolvedValue({
      id: faker.random.alphaNumeric(10),
      symbol: 'MSFT',
      amount: 10,
      price: 10,
      value: 100,
      type: 'buy',
      createdAt: new Date(),
    })
    mockQuote.symbolExists.mockResolvedValue(true)
    const handler = errorHandler(newHandler(mockTrade, mockQuote), testReporter())

    const resp = (await handler(testContext(), req)) as { status: number; body: object }

    expect(resp.status).toBe(201)
  })

  it('should not allow missing portfolioname', async () => {
    const req = testRequest()
    const handler = errorHandler(newHandler(mockTrade, mockQuote), testReporter())

    const resp = (await handler(testContext(), req)) as {
      status: number
      body: { error: { msg: string; reason: string } }
    }

    expect(resp.status).toBe(400)
    expect(resp.body.error.msg).toEqual('bad data')
    expect(resp.body.error.reason).toEqual('portfolioName is required')
  })
  it('should validate trade SYMBOL', async () => {
    const req = testRequest({
      body: { portfolioName: portfolioName, symbol: 'invalid', amount: 10, price: 10, type: 'buy' },
    })
    mockQuote.symbolExists.mockResolvedValue(false)
    const handler = errorHandler(newHandler(mockTrade, mockQuote), testReporter())

    const resp = (await handler(testContext(), req)) as {
      status: number
      body: { error: { msg: string; reason: string } }
    }

    expect(resp.status).toBe(400)
    expect(resp.body.error.msg).toEqual('bad data')
    expect(resp.body.error.reason).toEqual('invalid symbol')
  })

  it('should only allow buy / sell as trade type', async () => {
    const req = testRequest({
      body: { portfolioName: portfolioName, symbol: 'MSFT', amount: 10, price: 10, type: 'invalid' },
    })
    mockQuote.symbolExists.mockResolvedValue(true)
    const handler = errorHandler(newHandler(mockTrade, mockQuote), testReporter())

    const resp = (await handler(testContext(), req)) as {
      status: number
      body: { error: { msg: string; reason: string } }
    }

    expect(resp.status).toBe(400)
    expect(resp.body.error.msg).toEqual('bad data')
    expect(resp.body.error.reason).toEqual("Invalid enum value. Expected 'buy' | 'sell', received 'invalid'")
  })

  it('should return positive amount / value for sell trades', async () => {
    const req = testRequest({
      body: { portfolioName: portfolioName, symbol: 'MSFT', amount: 10, price: 10, type: 'sell' },
    })
    mockTrade.saveTrade.mockResolvedValue({
      id: faker.random.alphaNumeric(10),
      symbol: 'MSFT',
      amount: -10,
      price: 10,
      value: -100,
      type: 'buy',
      createdAt: new Date(),
    })
    mockQuote.symbolExists.mockResolvedValue(true)
    const handler = errorHandler(newHandler(mockTrade, mockQuote), testReporter())

    const resp = (await handler(testContext(), req)) as {
      status: number
      body: { resource: { amount: number; value: number } }
    }

    expect(resp.status).toBe(201)
    expect(resp.body.resource.amount > 0).toBeTruthy()
    expect(resp.body.resource.amount > 0).toBeTruthy()
  })
})
