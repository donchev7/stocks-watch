import type { Context } from '@azure/functions'
import type { Asset } from '../../entities'
import type { Logger } from '../../logger'

interface DB {
  listAssets(log: Logger): AsyncGenerator<{ resources: Asset[] }>
  updateAsset(log: Logger, asset: Asset): Promise<void>
  updateAsset(log: Logger, asset: Asset): Promise<void>
}

interface API {
  getPrice(symbol: string): Promise<{ price: number; tradingDay: Date }>
}

export const newHandler = (db: DB, api: API) => handler(db, api)

const updatePrice = async (db: DB, api: API, log: Logger, assets: Asset[]) => {
  for (const asset of assets) {
    const { price: newPrice, tradingDay } = await api.getPrice(asset.symbol)
    asset.price = newPrice
    asset.updatedAt = tradingDay
    asset.currentvalue = newPrice * asset.amount
    await db.updateAsset(log, asset)
  }
}

const handler = (db: DB, api: API) => {
  return async (context: Context, _: any): Promise<void> => {
    const timeStamp = new Date().toISOString()
    const log = context.log
    context.log('update-assets-job trigger function running', timeStamp)

    for await (const { resources } of db.listAssets(log)) {
      await updatePrice(db, api, log, resources)
    }
  }
}
