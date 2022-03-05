import type { Trade } from '../../entities'
import { testContext } from '../../helpers/test-helpers'
import { newHandler } from './handler'

describe('handlers/trade-created', () => {
  const DB = {
    upsertAsset: jest.fn()
  }

  it('upserts an asset', async () => {
    const dt = new Date()
    const trades: Trade[] = [
      { id: 'id', pk: 'pk', sk: 'sk', symbol: 'APPL', amount: 10, price: 9.8, value: 98, type: 'buy', createdAt: dt }
    ]
    const handler = newHandler(DB)
    await handler(testContext(), trades)

    expect(DB.upsertAsset).toHaveBeenLastCalledWith(testContext().log, trades[0])
  })
})
