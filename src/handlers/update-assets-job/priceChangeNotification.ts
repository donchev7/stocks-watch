import type { Context } from '@azure/functions'
import { Asset, priceChangeNotificationSchema } from '../../entities'

const percentageThreshold = 4
//@ts-ignore
const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)

const calculateChange = (asset: Asset) => {
  const minValue = Math.min(asset.lastPriceCheckValue ?? 0, asset.currentValue)
  const maxValue = Math.max(asset.lastPriceCheckValue ?? 0, asset.currentValue)

  return (1 - minValue / maxValue) * 100
}

const getNotification = (ctx: Context, asset: Asset, isUp: boolean) => ({
  id: ctx.invocationId,
  pk: `${dayOfYear}`,
  sk: asset.symbol,
  type: 'priceChange',
  isUp,
  asset,
})

export const createNotification = (ctx: Context, asset: Asset) => {
  const isUp = asset.currentValue > asset.lastPriceCheckValue
  const percentageChange = calculateChange(asset)

  if (percentageChange >= percentageThreshold) {
    return priceChangeNotificationSchema.parse(getNotification(ctx, asset, isUp))
  }

  return undefined
}
