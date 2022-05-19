import type { Asset } from '../../entities'

const percentageThreshold = 4

const calculateChange = (asset: Asset) => {
  const minValue = Math.min(asset.lastPriceCheckValue ?? 0, asset.currentValue)
  const maxValue = Math.max(asset.lastPriceCheckValue ?? 0, asset.currentValue)

  return (1 - minValue / maxValue) * 100
}

export const hasPriceChangeOccured = (asset: Asset) => {
  const percentageChange = calculateChange(asset)

  return percentageChange >= percentageThreshold
}
