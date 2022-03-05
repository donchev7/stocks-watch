import type { Resource, SqlQuerySpec } from '@azure/cosmos'
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
    sk: `symbol:${symbol}`
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
    currentValue: trade.price * trade.amount,
    createdAt: trade.createdAt,
    updatedAt: trade.createdAt
  }

  const { resource, requestCharge } = await assetClient.item(id, pk).read<Asset>()
  log.info(`[upsertAsset] requestCharge: ${requestCharge}`)

  if (!resource) {
    await assetClient.items.create(a)
    return
  }

  a.amount += resource.amount
  a.currentValue += resource.currentValue
  a.investmentValue += resource.investmentValue

  await assetClient.items.upsert(a, {
    accessCondition: { type: 'IfMatch', condition: resource._etag }
  })
}

const getAssets = async (log: Logger, portfolioName: string): Promise<Asset[]> => {
  log.info(`getting assets for portfolio ${portfolioName}`)

  const { pk } = keys('', portfolioName)
  const query: SqlQuerySpec = {
    query: 'select * from c where c.pk = @pk',
    parameters: [{ name: '@pk', value: pk }]
  }
  const entities: Asset[] = []
  const { resources, requestCharge } = await assetClient.items.query<Asset>(query).fetchAll()
  log.info(`[getAssets] requestCharge: ${requestCharge}`)

  if (!resources || resources.length == 0) {
    entities
  }

  for (const r of resources) {
    const entity = {
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt)
    }
    entities.push(assetSchema.parse(entity))
  }

  return entities
}

async function* listAssets(log: Logger) {
  log.info(`list all assets`)

  const itemIterator = assetClient.items.readAll<Asset>().getAsyncIterator()
  for await (const item of itemIterator) {
    log.info(`[listAssets] requestCharge: ${item.requestCharge}`)

    yield {
      resources: item.resources ?? []
    }
  }
}

const updateAsset = async (log: Logger, asset: Asset & Resource) => {
  log.info(`updating asset ${asset.id}`)

  await assetClient.items.upsert(asset, {
    accessCondition: { type: 'IfMatch', condition: asset._etag }
  })
}

export { getAssets, upsertAsset, updateAsset, listAssets }
