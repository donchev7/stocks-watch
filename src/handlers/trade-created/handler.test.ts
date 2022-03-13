import 'jest-extended'
import type { Trade } from '../../entities'
import { testContext } from '../../helpers/test-helpers'
import { newHandler } from './handler'

describe('handlers/trade-created', () => {
  const mockDB = {
    upsertAsset: jest.fn(),
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('upserts an asset', async () => {
    const dt = new Date()
    const trades: Trade[] = [
      { id: 'id', pk: 'pk', sk: 'sk', symbol: 'APPL', amount: 10, price: 9.8, value: 98, type: 'buy', createdAt: dt },
    ]
    const handler = newHandler(mockDB)
    await handler(testContext(), trades)

    expect(mockDB.upsertAsset).toHaveBeenLastCalledWith(testContext().log, trades[0])
  })
})
