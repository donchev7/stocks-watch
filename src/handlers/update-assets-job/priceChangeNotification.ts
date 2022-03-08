import type { Context } from '@azure/functions'
import { Asset, assetSchema, PriceChangeNotification } from '../../entities'

const percentageThreshold = 4

const calculateChange = (asset: Asset) => {
  const minValue = Math.min(asset.lastPriceCheckValue ?? 0, asset.currentValue)
  const maxValue = Math.max(asset.lastPriceCheckValue ?? 0, asset.currentValue)

  return (1 - minValue / maxValue) * 100
}

const getNotification = (ctx: Context, asset: Asset, isUp: boolean): PriceChangeNotification => ({
  id: ctx.invocationId,
  pk: ctx.invocationId,
  sk: 'NA',
  type: 'priceChange',
  isUp,
  asset,
})

export const createNotification = (ctx: Context, asset: Asset) => {
  const isUp = asset.currentValue > asset.lastPriceCheckValue
  const percentageChange = calculateChange(asset)
  const a = assetSchema.parse(asset) // using parse to strip cosmos metadata from asset

  if (percentageChange >= percentageThreshold) {
    return getNotification(ctx, a, isUp)
  }

  return undefined
}
