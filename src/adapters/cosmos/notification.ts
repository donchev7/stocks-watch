import type { PriceChangeNotification } from '../../entities'
import type { Logger } from '../../logger'
import { notificationClient } from './client'

export const createPriceChangeNotification = async (log: Logger, notification: PriceChangeNotification) => {
  log.info('creating priceChangeNotification')
  await notificationClient.items.upsert(notification)
}
