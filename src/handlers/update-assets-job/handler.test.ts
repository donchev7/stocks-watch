import type { Asset } from '../../entities'
import { testContext } from '../../helpers/test-helpers'
import { newHandler } from './handler'

const dt = new Date()

async function* mockedListAssets(assets: Partial<Asset>[]) {
  yield { resources: assets }
}

const mockedDB = (assets: Partial<Asset>[]) => ({
  listAssets: jest.fn().mockImplementationOnce(() => mockedListAssets(assets)),
  updateAsset: jest.fn(),
  createPriceChangeNotification: jest.fn(),
})

describe('handlers/update-assets-job', () => {
  const API = {
    getPrice: jest.fn().mockResolvedValue({ price: 10, tradingDay: dt }),
  }

  it('updates the price of the asset', async () => {
    const oldAsset = {
      amount: 10,
    }
    const DB = mockedDB([oldAsset])
    const updatedAssets = {
      amount: 10,
      currentValue: 100,
      price: 10,
      updatedAt: dt,
    }
    const handler = newHandler(DB, API)
    await handler(testContext(), '')

    expect(DB.updateAsset).toBeCalledWith(testContext().log, updatedAssets)
  })
})
