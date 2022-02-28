import type { SqlQuerySpec } from '@azure/cosmos'
import { Trade, Asset, assetSchema } from '../../entities'
import type { Logger } from '../../logger'
import { assetClient } from './client'

const upsertAsset = async (log: Logger, t: Trade) => {
  log.info(`updating portfolioId ${t.pk}`)

  const a: Asset = {
    id: t.pk + t.symbol,
    pk: t.pk,
    sk: t.symbol,
    symbol: t.symbol,
    price: t.price,
    amount: t.amount,
    investmentValue: t.price * t.amount,
    currentvalue: t.price * t.amount,
    createdAt: t.createdAt,
    updatedAt: t.createdAt,
  }

  const { resource } = await assetClient
    .item(t.pk + t.symbol, t.pk)
    .read<Asset>()
  if (!resource) {
    await assetClient.items.create(a)
    return
  }

  a.amount += resource.amount
  a.currentvalue += resource.currentvalue
  a.investmentValue += resource.investmentValue

  await assetClient.items.upsert(a, {
    accessCondition: { type: 'IfMatch', condition: resource._etag },
  })
}

const getAssets = async (
  log: Logger,
  portfolioName: string,
): Promise<Asset[]> => {
  log.info(`getting assets for portfolio ${portfolioName}`)

  const query: SqlQuerySpec = {
    query: 'select * from c where c.pk = @pk',
    parameters: [{ name: '@pk', value: portfolioName }],
  }
  const entities: Asset[] = []
  const { resources } = await assetClient.items.query<Asset>(query).fetchAll()

  if (!resources || resources.length == 0) {
    entities
  }

  for (const r of resources) {
    const entity = {
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    }
    entities.push(assetSchema.parse(entity))
  }

  return entities
}

export { getAssets, upsertAsset }

// const { resource } = await portfolio.item(t.pk).read<Portfolio>()
// if (!resource) {
//   log.error(`could not find portfolio with id ${t.pk}`)
//   return
// }

// resource.assets?.push(a)

// await portfolio.items.upsert(resource, {
//   accessCondition: { type: 'IfMatch', condition: resource._etag },
// })
