import {
  BulkOperationType,
  CosmosClient,
  JSONObject,
  OperationInput,
  PatchOperationType,
  SqlQuerySpec,
} from '@azure/cosmos'
import { nanoid } from 'nanoid'
import * as cfg from '../config'
import type { Logger } from '../logger'
import {
  Portfolio,
  PortfolioProps,
  portfolioSchema,
  Trade,
  tradeSchema,
} from '../entities'

const client = new CosmosClient({
  endpoint: cfg.cosmosEndpoint,
  key: cfg.cosmosKey,
})

const cosmos = client.database(cfg.cosmosDB).container(cfg.cosmosTable)

const toJSONobj = (t: object) => {
  const entity: JSONObject = {}
  for (const [key, value] of Object.entries(t)) {
    if (
      value instanceof Date &&
      Object.prototype.toString.call(value) === '[object Date]'
    ) {
      entity[key] = value.toISOString()
      continue
    }
    entity[key] = value
  }

  return entity
}

const savePortfolio = async (log: Logger, p: Portfolio): Promise<Portfolio> => {
  p.id = p.name
  p.pk = p.name
  p.createdAt = new Date()
  p.updatedAt = new Date()
  p.trades = []
  log.info(`saving portfolio ${p.name}`)

  await cosmos.items.create(p)

  return portfolioSchema.parseAsync(p)
}

const saveTrade = async (
  log: Logger,
  t: Trade,
  portfolioId: string,
): Promise<Trade> => {
  log.info(`saving trade ${t.symbol}`)
  t.id = nanoid()
  t.createdAt = new Date()
  t.priceUpdatedAt = new Date()
  t.pk = t.symbol
  t.value = t.amount * t.price

  const tradesKey = PortfolioProps('trades')
  const updatedKey = PortfolioProps('updatedAt')
  const arrayIndex = '-' // append

  const operations: OperationInput[] = [
    {
      operationType: BulkOperationType.Create,
      partitionKey: t.symbol,
      resourceBody: toJSONobj(t),
    },
    {
      operationType: BulkOperationType.Patch,
      partitionKey: portfolioId,
      id: portfolioId,
      resourceBody: {
        operations: [
          {
            op: PatchOperationType.add,
            path: `/${tradesKey}/${arrayIndex}`,
            value: t.id,
          },
          {
            op: PatchOperationType.add,
            path: `/${updatedKey}`,
            value: new Date(),
          },
        ],
      },
    },
  ]
  const resp = await cosmos.items.bulk(operations)
  log.info(resp)

  return tradeSchema.parseAsync(t)
}

const getPortfolio = async (log: Logger, name: string): Promise<Portfolio> => {
  log.info(`getting portfolio ${name}`)

  const query: SqlQuerySpec = {
    query: 'select * from c where c.id = @name',
    parameters: [{ name: '@name', value: name }],
  }

  const { resources } = await cosmos.items.query<Portfolio>(query).fetchAll()

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

  const { resources } = await cosmos.items.readAll().fetchAll()
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
  }
}

export default newRepository
