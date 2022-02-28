import { Portfolio, portfolioSchema } from '../../entities'
import type { Logger } from '../../logger'
import { portfolioClient } from './client'

const getPortfolio = async (log: Logger, name: string): Promise<Portfolio> => {
  log.info(`getting portfolio ${name}`)

  const { resource } = await portfolioClient.item(name, name).read()

  if (!resource) {
    throw new Error('nothing found')
  }

  const entity = { ...resource }

  // because cosmosDB stores dates as strings
  entity.createdAt = new Date(entity.createdAt)
  entity.updatedAt = new Date(entity.createdAt)

  return portfolioSchema.parseAsync(entity)
}

const savePortfolio = async (log: Logger, p: Portfolio): Promise<Portfolio> => {
  p.id = p.name
  p.pk = p.name
  p.sk = 'NA'
  p.createdAt = new Date()
  p.updatedAt = new Date()
  await portfolioSchema.parseAsync(p)
  log.info(`saving portfolio ${p.name}`)

  await portfolioClient.items.create(p)

  return p
}

const listPortfolios = async (log: Logger) => {
  log.info('getting all portfolios')

  const { resources } = await portfolioClient.items.readAll().fetchAll()
  if (!resources) {
    throw new Error('Shouldnt happen')
  }

  return resources
}

export default { getPortfolio, listPortfolios, savePortfolio }
