import type { SqlQuerySpec } from '@azure/cosmos'
import { Trade, Asset, assetSchema } from '../../entities'
import type { Logger } from '../../logger'
import { assetClient } from './client'

const assetPk = (portfolioId: string) => `asset:${portfolioId}`
const assetSk = (symbol: string) => `symbol:${symbol}`
const assetKey = (pk: string, symbol: string) => `${pk}:${symbol}`

const upsertAsset = async (log: Logger, t: Trade) => {
  log.info(`updating portfolioId ${t.pk}`)

  const a: Asset = {
    id: assetKey(t.pk, t.symbol),
    pk: assetPk(t.pk),
    sk: assetSk(t.symbol),
    symbol: t.symbol,
    price: t.price,
    amount: t.amount,
    investmentValue: t.price * t.amount,
    currentvalue: t.price * t.amount,
    createdAt: t.createdAt,
    updatedAt: t.createdAt,
  }

  const { resource } = await assetClient
    .item(assetKey(t.pk, t.symbol), assetPk(t.pk))
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
    parameters: [{ name: '@pk', value: assetPk(portfolioName) }],
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
