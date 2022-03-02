import type { FeedOptions } from '@azure/cosmos'
import { Portfolio, portfolioSchema } from '../../entities'
import type { Logger } from '../../logger'
import { portfolioClient } from './client'

const keys = (portfolioName?: string, dt = new Date()) => {
  return {
    id: `portfolioName:${portfolioName}`,
    pk: `portfolio:${portfolioName}`,
    sk: dt.toISOString(),
  }
}

const getPortfolio = async (
  log: Logger,
  portfolioName: string,
): Promise<Portfolio> => {
  log.info(`getting portfolio ${portfolioName}`)

  const { id, pk } = keys(portfolioName)
  const { resource, requestCharge } = await portfolioClient.item(id, pk).read()
  log.info(`[getPortfolio] requestCharge: ${requestCharge}`)

  if (!resource) {
    throw new Error('nothing found')
  }

  const entity = { ...resource }

  // because cosmosDB stores dates as strings
  entity.createdAt = new Date(entity.createdAt)
  entity.updatedAt = new Date(entity.createdAt)

  return portfolioSchema.parseAsync(entity)
}

const deletePortfolio = async (
  log: Logger,
  portfolioName: string,
): Promise<void> => {
  log.info(`deleting portfolio ${portfolioName}`)

  const { id, pk } = keys(portfolioName)
  const { requestCharge } = await portfolioClient.item(id, pk).delete()

  log.info(`[deletePortfolio] requestCharge: ${requestCharge}`)
}

const savePortfolio = async (
  log: Logger,
  p: Portfolio,
  now = new Date(),
): Promise<Portfolio> => {
  const { id, pk, sk } = keys(p.name, now)
  p.id = id
  p.pk = pk
  p.sk = sk
  p.createdAt = now
  p.updatedAt = now

  await portfolioSchema.parseAsync(p)

  log.info(`saving portfolio ${p.name}`)

  const { requestCharge } = await portfolioClient.items.create(p)
  log.info(`[savePortfolio] requestCharge: ${requestCharge}`)

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

  const resp = await portfolioClient.items.readAll<Portfolio>(opts).fetchNext()
  log.info(`[listPortfolios] requestCharge: ${resp.requestCharge}`)

  let parsedContinuationToken
  if (resp.continuationToken) {
    parsedContinuationToken = Buffer.from(resp.continuationToken).toString(
      'base64',
    )
  }

  return {
    resources: resp.resources,
    continuationToken: parsedContinuationToken,
    hasMoreResults: resp.hasMoreResults,
  }
}

export { getPortfolio, listPortfolios, savePortfolio, deletePortfolio }
