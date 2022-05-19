import 'jest-extended'
import type { Asset } from '../../entities'
import { testContext } from '../../helpers/test-helpers'
import { newHandler } from './handler'

async function* mockedListAssets(assets: Partial<Asset>[]) {
  yield { resources: assets }
}

describe('handlers/update-assets-job', () => {
  const dt = new Date()
  const mockedDB = {
    listAssets: jest.fn(),
    updateAsset: jest.fn(),
    createPriceChangeNotification: jest.fn(),
  }
  const mockAPI = {
    getPrice: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('updates the price of the asset and inserts a notification (positivePriceChange)', async () => {
    const oldAsset = {
      symbol: 'MSFT',
      amount: 10,
      price: 10,
      currentValue: 100,
      investmentValue: 100,
      lastPriceCheckValue: 100,
      lastMonthlyCheckValue: 100,
      createdAt: dt,
      updatedAt: dt,
    }
    mockedDB.listAssets.mockImplementationOnce(() => mockedListAssets([oldAsset]))
    mockAPI.getPrice.mockResolvedValue({ price: 12, tradingDay: dt })

    const handler = newHandler(mockedDB, mockAPI)
    await handler(testContext(), '')

    expect(mockedDB.updateAsset).toBeCalledWith(
      testContext().log,
      expect.objectContaining({ lastPriceCheckValue: 120, price: 12 }),
    )

    expect(mockedDB.createPriceChangeNotification).toBeCalledWith(
      testContext().log,
      expect.objectContaining({ lastPriceCheckValue: 120, price: 12 }),
    )
  })

  it('updates the price of the asset and inserts a notification (negativePriceChange)', async () => {
    const oldAsset = {
      symbol: 'MSFT',
      amount: 10,
      price: 10,
      currentValue: 100,
      investmentValue: 100,
      lastPriceCheckValue: 100,
      lastMonthlyCheckValue: 100,
      createdAt: dt,
      updatedAt: dt,
    }
    mockedDB.listAssets.mockImplementationOnce(() => mockedListAssets([oldAsset]))
    mockAPI.getPrice.mockResolvedValue({ price: 8, tradingDay: dt })

    const handler = newHandler(mockedDB, mockAPI)
    await handler(testContext(), '')

    expect(mockedDB.updateAsset).toBeCalledWith(
      testContext().log,
      expect.objectContaining({ lastPriceCheckValue: 80, price: 8 }),
    )
    expect(mockedDB.createPriceChangeNotification).toBeCalledWith(
      testContext().log,
      expect.objectContaining({ lastPriceCheckValue: 80, price: 8 }),
    )
  })

  it('updates the price of the asset and does not insert a notification', async () => {
    const oldAsset = {
      symbol: 'MSFT',
      amount: 10,
      price: 10,
      currentValue: 100,
      investmentValue: 100,
      lastPriceCheckValue: 100,
      lastMonthlyCheckValue: 100,
      createdAt: dt,
      updatedAt: dt,
    }
    mockedDB.listAssets.mockImplementationOnce(() => mockedListAssets([oldAsset]))
    mockAPI.getPrice.mockResolvedValue({ price: 10.39, tradingDay: dt })

    const handler = newHandler(mockedDB, mockAPI)
    await handler(testContext(), '')

    expect(mockedDB.updateAsset).toBeCalledWith(testContext().log, oldAsset)
    expect(mockedDB.createPriceChangeNotification).not.toHaveBeenCalled()
  })
})
