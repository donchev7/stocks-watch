import { CosmosClient, SqlQuerySpec } from '@azure/cosmos'
import * as cfg from '../config'
import type { Logger } from '../logger'
import { Portfolio, portfolioSchema } from '../entities'

const client = new CosmosClient({
  endpoint: cfg.cosmosEndpoint,
  key: cfg.cosmosKey,
})

const cosmos = client.database(cfg.cosmosDB).container(cfg.cosmosTable)

const savePortfolio = async (log: Logger, p: Portfolio): Promise<Portfolio> => {
  p.id = p.name
  p.createdAt = new Date()
  p.updatedAt = new Date()
  log.info(`saving portfolio ${p.name}`)

  await cosmos.items.create(p)

  return portfolioSchema.parseAsync(p)
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

  cosmos.items.readAll()
}

const newRepository = () => {
  return {
    savePortfolio,
    getPortfolio,
  }
}

export default newRepository
