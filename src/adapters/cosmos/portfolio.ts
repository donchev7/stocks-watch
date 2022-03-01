import type { FeedOptions } from '@azure/cosmos'
import { Portfolio, portfolioSchema } from '../../entities'
import type { Logger } from '../../logger'
import { portfolioClient } from './client'

const portfolioPk = (portfolioName: string) => `portfolio:${portfolioName}`
const portfolioSk = () => `NA`
const portfolioKey = (portfolioName: string) => `portfolioName:${portfolioName}`

const getPortfolio = async (log: Logger, name: string): Promise<Portfolio> => {
  log.info(`getting portfolio ${name}`)

  const { resource } = await portfolioClient
    .item(portfolioKey(name), portfolioPk(name))
    .read()

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
  p.id = portfolioKey(p.name)
  p.pk = portfolioPk(p.name)
  p.sk = portfolioSk()
  p.createdAt = new Date()
  p.updatedAt = new Date()
  await portfolioSchema.parseAsync(p)
  log.info(`saving portfolio ${p.name}`)

  await portfolioClient.items.create(p)

  return p
}

const listPortfolios = async (log: Logger, token?: string, limit = 50) => {
  log.info('getting all portfolios')
  if (limit <= 0) {
    limit = 50
  }

  let opts: FeedOptions = {
    maxItemCount: limit,
  }

  if (token) {
    opts = {
      ...opts,
      continuationToken: Buffer.from(token, 'base64').toString('utf-8'),
    }
  }

  const {
    resources,
    continuationToken,
    hasMoreResults,
  } = await portfolioClient.items.readAll<Portfolio>(opts).fetchNext()

  let parsedContinuationToken
  if (continuationToken) {
    parsedContinuationToken = Buffer.from(continuationToken).toString('base64')
  }

  return {
    resources,
    continuationToken: parsedContinuationToken,
    hasMoreResults,
  }
}

export { getPortfolio, listPortfolios, savePortfolio }
