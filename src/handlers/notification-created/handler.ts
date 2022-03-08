import type { Context } from '@azure/functions'
import type { PriceChangeNotification } from '../../entities'

interface reporter {
  reportAssetPriceChange(notfication: PriceChangeNotification): Promise<void>
}

export const newHandler = (r: reporter) => handler(r)

const handler = (r: reporter) => {
  return async (context: Context, notifications: PriceChangeNotification[]): Promise<void> => {
    for (const n of notifications) {
      context.log('sending notification', n.id)
      await r.reportAssetPriceChange(n)
    }
  }
}
