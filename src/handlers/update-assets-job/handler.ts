import type { Context } from '@azure/functions'
import type { Asset, PriceChangeNotification } from '../../entities'
import type { Logger } from '../../logger'
import { createNotification } from './priceChangeNotification'

interface DB {
  listAssets(log: Logger): AsyncGenerator<{ resources: Asset[] }>
  updateAsset(log: Logger, asset: Asset): Promise<void>
  createPriceChangeNotification(log: Logger, notification: PriceChangeNotification): Promise<void>
}

interface API {
  getPrice(symbol: string): Promise<{ price: number; tradingDay: Date }>
}

export const newHandler = (db: DB, api: API) => handler(db, api)

const updatePrice = async (ctx: Context, db: DB, api: API, assets: Asset[]) => {
  for (const asset of assets) {
    const { price: newPrice, tradingDay } = await api.getPrice(asset.symbol)
    asset.price = newPrice
    asset.updatedAt = tradingDay
    asset.currentValue = newPrice * asset.amount
    const n = createNotification(ctx, asset)
    if (n) {
      await db.createPriceChangeNotification(ctx.log, n)
      // notify again when new priceChange occurs
      asset.lastPriceCheckValue = asset.currentValue
    }
    await db.updateAsset(ctx.log, asset)
  }
}

const handler = (db: DB, api: API) => {
  return async (context: Context, _: any): Promise<void> => {
    const timeStamp = new Date().toISOString()
    const log = context.log
    context.log('update-assets-job trigger function running', timeStamp)

    for await (const { resources } of db.listAssets(log)) {
      await updatePrice(context, db, api, resources)
    }
  }
}
