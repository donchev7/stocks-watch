import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'
import { Asset, assetSchema, metaFields, Portfolio } from '../../entities'
import { maxMsg, minMsg, requiredString } from '../../helpers/validation'
import type { Logger } from '../../logger'

const portfolioResponse = z.object({
  resource: z.object({
    name: z.string(),
    createdAt: z.date(),
    assets: z.array(assetSchema.omit(metaFields)).optional()
  })
})

const portfolioName = z
  .string(requiredString('portfolioName'))
  .min(1, minMsg('portfolioName'))
  .max(100, maxMsg('portfolioName'))

interface DB {
  getPortfolio(log: Logger, name: string): Promise<Portfolio>
  getAssets(log: Logger, portfolioName: string): Promise<Asset[]>
}

export const newHandler = (db: DB) => handler(db)

const handler = function (db: DB) {
  return async (context: Context, _: HttpRequest) => {
    const nameInput = context.bindingData['name']
    const pName = await portfolioName.parseAsync(nameInput)

    const entity = await db.getPortfolio(context.log, pName)
    const entityAssets = await db.getAssets(context.log, pName)

    const resource = { ...entity, assets: entityAssets }

    return {
      status: 200,
      body: portfolioResponse.parse({ resource })
    }
  }
}
