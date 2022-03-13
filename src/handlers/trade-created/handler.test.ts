import faker from '@faker-js/faker'
import 'jest-extended'
import type { Trade } from '../../entities'
import { fakeTrade } from '../../helpers/test-data'
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
    const trades = [
      fakeTrade({ id: faker.random.alphaNumeric(10), pk: 'pk', sk: 'sk', createdAt: new Date() }) as Trade,
    ]
    const handler = newHandler(mockDB)
    await handler(testContext(), trades)

    expect(mockDB.upsertAsset).toHaveBeenLastCalledWith(testContext().log, trades[0])
  })
})
