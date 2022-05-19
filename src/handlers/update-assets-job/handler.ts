import type { Context } from '@azure/functions'
import type { Asset } from '../../entities'
import type { Logger } from '../../logger'
import { hasPriceChangeOccured } from './priceChange'

interface DB {
  listAssets(log: Logger): AsyncGenerator<{ resources: Asset[] }>
  updateAsset(log: Logger, asset: Asset): Promise<void>
  createPriceChangeNotification(log: Logger, asset: Asset): Promise<void>
}

interface API {
  getPrice(log: Logger, symbol: string): Promise<{ price?: number; tradingDay?: Date }>
}

export const newHandler = (db: DB, api: API) => handler(db, api)

const updatePrice = async (ctx: Context, db: DB, api: API, assets: Asset[]) => {
  for (const asset of assets) {
    const { price: newPrice, tradingDay } = await api.getPrice(ctx.log, asset.symbol)
    asset.price = newPrice ?? asset.price
    asset.updatedAt = tradingDay ?? asset.updatedAt
    asset.currentValue = asset.price * asset.amount
    if (hasPriceChangeOccured(asset)) {
      await db.createPriceChangeNotification(ctx.log, asset)
      asset.lastPriceCheckValue = asset.currentValue
    }
    // if this fails the function will be re-tried by Azure Functions
    // second notification wont be send out because the notification already exists (invocationId)
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
