import 'jest-extended'
import { testContext } from '../../helpers/test-helpers'
import { newHandler } from './handler'
import { fakePriceNotification } from '../../helpers/test-data'

describe('handlers/notification-created', () => {
  const mockReporter = {
    reportAssetPriceChange: jest.fn(),
  }

  const priceChangeNotifications = [fakePriceNotification()]

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
