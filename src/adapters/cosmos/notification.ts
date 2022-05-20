import { nanoid } from 'nanoid'
import { Asset, PriceChangeNotification, priceChangeNotificationSchema } from '../../entities'
import type { Logger } from '../../logger'
import { notificationClient } from './client'

const getNotification = (asset: Asset, id = nanoid()): PriceChangeNotification => {
  //@ts-ignore
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
  const isUp = asset.currentValue > asset.lastPriceCheckValue

  return priceChangeNotificationSchema.parse({
    id,
    pk: `${dayOfYear}`,
    sk: asset.symbol,
    type: 'priceChange',
    isUp,
    asset,
  })
}

export const createPriceChangeNotification = async (log: Logger, asset: Asset) => {
  log.info('creating priceChangeNotification')
  await notificationClient.items.upsert(getNotification(asset))
}
