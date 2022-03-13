import { faker } from '@faker-js/faker'
import { testContext, testReporter, testRequest } from '../../helpers/test-helpers'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

describe('handlers/create-portfolio', () => {
  const portfolioName = `${faker.random.alphaNumeric(10)}`
  const mockPortfolio = {
    savePortfolio: jest.fn(),
  }
  it('should create a portfolio', async () => {
    const req = testRequest({ body: { name: portfolioName } })
    mockPortfolio.savePortfolio.mockResolvedValue({
      id: faker.random.alphaNumeric(10),
      name: portfolioName,
      createdAt: new Date(),
    })
    const handler = errorHandler(newHandler(mockPortfolio), testReporter())
    const resp = (await handler(testContext(), req)) as { status: number; body: object }

    expect(resp.status).toBe(201)
  })

  it('should not allow missing portfolioname', async () => {
    const req = testRequest()
    const handler = errorHandler(newHandler(mockPortfolio), testReporter())

    const resp = (await handler(testContext(), req)) as {
      status: number
      body: { error: { msg: string; reason: string } }
    }

    expect(resp.status).toBe(400)
    expect(resp.body.error.msg).toEqual('bad data')
    expect(resp.body.error.reason).toEqual('name is required')
  })
})
