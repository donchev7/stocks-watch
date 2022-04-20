import type { ErrorResponse } from '@azure/cosmos'
import type { PriceChangeNotification } from '../../entities'
import type { Logger } from '../../logger'
import { notificationClient } from './client'

const handleDBError = (symbol: string, log: Logger, err: ErrorResponse) => {
  if (err.code === 409) {
    log.warn(`Notification already exists for ${symbol}`)
    return
  }

  throw err
}

export const createPriceChangeNotification = async (log: Logger, notification: PriceChangeNotification) => {
  log.info('creating priceChangeNotification')
  await notificationClient.items
    .upsert(notification)
    .catch((err: ErrorResponse) => handleDBError(notification.asset.symbol, log, err))
}
