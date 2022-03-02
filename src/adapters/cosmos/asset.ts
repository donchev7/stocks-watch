import type { SqlQuerySpec } from '@azure/cosmos'
import { Trade, Asset, assetSchema } from '../../entities'
import type { Logger } from '../../logger'
import { assetClient } from './client'

const keys = (symbol: string, portfolioName?: string) => {
  if (!portfolioName) {
    throw new Error('shouldnt happen')
  }
  return {
    id: `${portfolioName}:${symbol}`,
    pk: `asset:${portfolioName}`,
    sk: `symbol:${symbol}`,
  }
}

const upsertAsset = async (log: Logger, trade: Trade) => {
  log.info(`updating portfolioId ${trade.pk}`)

  const [_, portfolioName] = trade.pk.split(':')

  const { id, pk, sk } = keys(trade.symbol, portfolioName)
  const a: Asset = {
    id,
    pk,
    sk,
    symbol: trade.symbol,
    price: trade.price,
    amount: trade.amount,
    investmentValue: trade.price * trade.amount,
    currentvalue: trade.price * trade.amount,
    createdAt: trade.createdAt,
    updatedAt: trade.createdAt,
  }

  const { resource, requestCharge } = await assetClient
    .item(id, pk)
    .read<Asset>()
  log.info(`[upsertAsset] requestCharge: ${requestCharge}`)

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

  const { pk } = keys('', portfolioName)
  const query: SqlQuerySpec = {
    query: 'select * from c where c.pk = @pk',
    parameters: [{ name: '@pk', value: pk }],
  }
  const entities: Asset[] = []
  const { resources, requestCharge } = await assetClient.items
    .query<Asset>(query)
    .fetchAll()
  log.info(`[getAssets] requestCharge: ${requestCharge}`)

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
