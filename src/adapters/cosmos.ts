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

const getPortfolio = async (log: Logger, name: string) => {
  log.info(`getting portfolio ${name}`)

  const query: SqlQuerySpec = {
    query: 'select * from c where c.id = @name',
    parameters: [{ name: '@name', value: name }],
  }

  const { resources } = await cosmos.items.query(query).fetchAll()

  if (!resources || resources.length == 0) {
    throw new Error('nothing found')
  }

  if (resources.length > 1) {
    throw new Error('conflict should be only one resource')
  }

  return portfolioSchema.parseAsync(resources[0])
}

const newRepository = () => {
  return {
    savePortfolio,
    getPortfolio,
  }
}

export default newRepository
