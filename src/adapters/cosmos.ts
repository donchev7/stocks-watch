import { CosmosClient, SqlQuerySpec } from '@azure/cosmos'
import * as cfg from '../config'
import type { Logger } from '../logger'
import {
  Asset,
  Portfolio,
  portfolioSchema,
  Trade,
  tradeSchema,
} from '../entities'
import { nanoid } from 'nanoid'

// const getAssetQuery: SqlQuerySpec = {
//   query: 'select * from c where c.pk = @pk',
//   parameters: [{ name: '@pk', value: t.pk }],
// }

const client = new CosmosClient({
  endpoint: cfg.cosmosEndpoint,
  key: cfg.cosmosKey,
})

const portfolio = client
  .database(cfg.cosmosDB)
  .container(cfg.portfolioTableName)
const trade = client.database(cfg.cosmosDB).container(cfg.tradeTableName)
const asset = client.database(cfg.cosmosDB).container(cfg.assetTableName)

const savePortfolio = async (log: Logger, p: Portfolio): Promise<Portfolio> => {
  p.id = p.name
  p.pk = p.name
  p.sk = 'NA'
  p.createdAt = new Date()
  p.updatedAt = new Date()
  await portfolioSchema.parseAsync(p)
  log.info(`saving portfolio ${p.name}`)

  await portfolio.items.create(p)

  return p
}

const updatePortfolioAsset = async (log: Logger, t: Trade) => {
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

  const { resource } = await asset.item(t.pk + t.symbol, t.pk).read<Asset>()
  if (!resource) {
    await asset.items.create(a)
    return
  }

  a.amount += resource.amount
  a.currentvalue += resource.currentvalue
  a.investmentValue += resource.investmentValue

  await asset.items.upsert(a, {
    accessCondition: { type: 'IfMatch', condition: resource._etag },
  })

  // const { resource } = await portfolio.item(t.pk).read<Portfolio>()
  // if (!resource) {
  //   log.error(`could not find portfolio with id ${t.pk}`)
  //   return
  // }

  // resource.assets?.push(a)

  // await portfolio.items.upsert(resource, {
  //   accessCondition: { type: 'IfMatch', condition: resource._etag },
  // })
}

const saveTrade = async (
  log: Logger,
  t: Trade,
  portfolioId: string,
): Promise<Trade> => {
  log.info(`saving trade ${t.symbol}`)

  t.pk = portfolioId
  t.sk = new Date().toISOString()
  t.id = nanoid()
  t.createdAt = new Date()
  t.value = t.amount * t.price

  await tradeSchema.parseAsync(t)
  await trade.items.create(t)

  return t
}

const getPortfolio = async (log: Logger, name: string): Promise<Portfolio> => {
  log.info(`getting portfolio ${name}`)

  const query: SqlQuerySpec = {
    query: 'select * from c where c.id = @name',
    parameters: [{ name: '@name', value: name }],
  }

  const { resources } = await portfolio.items.query<Portfolio>(query).fetchAll()

  if (!resources || resources.length == 0) {
    throw new Error('nothing found')
  }

  if (resources.length > 1) {
    throw new Error('conflict. received more than one portfolio entity')
  }

  const entity = { ...resources[0] }
  if (!entity.createdAt || !entity.updatedAt) {
    throw new Error('missing dates')
  }

  // because cosmosDB stores dates as strings
  entity.createdAt = new Date(entity.createdAt)
  entity.updatedAt = new Date(entity.createdAt)

  return portfolioSchema.parseAsync(entity)
}

const listPortfolios = async (log: Logger) => {
  log.info('getting all portfolios')

  const { resources } = await portfolio.items.readAll().fetchAll()
  if (!resources) {
    throw new Error('Shouldnt happen')
  }

  return resources
}

const newRepository = () => {
  return {
    savePortfolio,
    getPortfolio,
    listPortfolios,
    saveTrade,
    updatePortfolioAsset,
  }
}

export default newRepository
