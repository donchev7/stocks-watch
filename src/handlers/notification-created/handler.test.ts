import 'jest-extended'
import faker from '@faker-js/faker'
import type { PriceChangeNotification } from '../../entities'
import { testContext } from '../../helpers/test-helpers'
import { newHandler } from './handler'

describe('handlers/notification-created', () => {
  const mockReporter = {
    reportAssetPriceChange: jest.fn(),
  }

  const priceChangeNotifications: PriceChangeNotification[] = [
    {
      type: 'priceChange',
      isUp: true,
      id: faker.random.alphaNumeric(10),
      pk: 'MSFT',
      sk: 'NA',
      asset: {
        symbol: 'MSFT',
        price: 100,
        amount: 10,
        investmentValue: 100,
        lastPriceCheckValue: 100,
        lastMonthlyCheckValue: 100,
        currentValue: 100,
        createdAt: new Date().toISOString(),
      },
    },
  ]

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('should report a price change', async () => {
    const handler = newHandler(mockReporter)
    await handler(testContext(), priceChangeNotifications)

    expect(mockReporter.reportAssetPriceChange).toHaveBeenCalledWith(priceChangeNotifications[0])
  })
})
