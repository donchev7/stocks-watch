import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'
import { Asset, assetSchema, metaFields, Portfolio } from '../../entities'
import { maxMsg, minMsg, requiredString } from '../../helpers/validation'
import type { Logger } from '../../logger'

const portfolioResponse = z.object({
  resource: z.object({
    name: z.string(),
    createdAt: z.date(),
    change: z.string(),
    assets: z.array(assetSchema.omit(metaFields).extend({ change: z.string() })).optional(),
  }),
})

const portfolioName = z
  .string(requiredString('portfolioName'))
  .min(1, minMsg('portfolioName'))
  .max(100, maxMsg('portfolioName'))

interface DB {
  getPortfolio(log: Logger, name: string): Promise<Portfolio>
  getAssets(log: Logger, portfolioName: string): Promise<Asset[]>
}

const isPositive = (asset: Asset) => asset.lastPriceCheckValue > asset.investmentValue

const calculateChange = (asset: Asset) => {
  const minValue = Math.min(asset.lastPriceCheckValue ?? 0, asset.investmentValue)
  const maxValue = Math.max(asset.lastPriceCheckValue ?? 0, asset.investmentValue)
  const result = (1 - minValue / maxValue) * 100

  return isPositive(asset) ? result : -result
}

const getChange = (asset: Asset) => {
  const value = calculateChange(asset)

  return `${value.toFixed(2)}%`
}

export const newHandler = (db: DB) => handler(db)

const handler = function (db: DB) {
  return async (context: Context, _: HttpRequest) => {
    const nameInput = context.bindingData['name']
    const pName = await portfolioName.parseAsync(nameInput)
    let portfolioPerformance = 0

    const entity = await db.getPortfolio(context.log, pName)
    const entityAssets = await db.getAssets(context.log, pName)
    const assets = entityAssets.map((asset) => {
      portfolioPerformance += calculateChange(asset)

      return {
        ...asset,
        change: getChange(asset),
      }
    })

    const portfolioChange = (portfolioPerformance / assets.length).toFixed(2) + '%'
    const resource = { ...entity, change: portfolioChange, assets }

    return {
      status: 200,
      body: portfolioResponse.parse({ resource }),
    }
  }
}
