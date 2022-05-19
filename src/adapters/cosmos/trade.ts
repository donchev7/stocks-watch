import type { FeedOptions, FeedResponse, SqlQuerySpec } from '@azure/cosmos'
import { nanoid } from 'nanoid'
import { Trade, tradeSchema } from '../../entities'
import type { Logger } from '../../logger'
import { tradeClient } from './client'

const keys = (portfolioName?: string, dt = new Date(), id = nanoid()) => {
  if (!portfolioName) {
    throw new Error('shouldnt happen')
  }
  return {
    id,
    pk: `trade:${portfolioName}`,
    sk: dt.toISOString(),
  }
}

const saveTrade = async (log: Logger, t: Trade, portfolioName: string, now = new Date()): Promise<Trade> => {
  log.info(`saving trade ${t.symbol}`)

  const { id, pk, sk } = keys(portfolioName, now)
  t.pk = pk
  t.sk = sk
  t.id = id
  t.createdAt = now
  t.value = t.amount * t.price

  await tradeSchema.parseAsync(t)
  const { requestCharge } = await tradeClient.items.create(t)
  log.info(`[saveTrade] requestCharge: ${requestCharge}`)

  return t
}

const listTrades = async (log: Logger, portfolioName?: string, token?: string, limit = 50) => {
  log.info('getting all trades')

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

  let resp: FeedResponse<Trade>

  if (portfolioName) {
    const { pk } = keys(portfolioName)
    const query: SqlQuerySpec = {
      query: 'select * from c where c.pk = @pk order by c.sk DESC',
      parameters: [{ name: '@pk', value: pk }],
    }
    resp = await tradeClient.items.query<Trade>(query, opts).fetchNext()
  } else {
    resp = await tradeClient.items.readAll<Trade>(opts).fetchNext()
  }

  log.info(`[listTrades] requestCharge: ${resp.requestCharge}`)

  let parsedContinuationToken
  if (resp.continuationToken) {
    parsedContinuationToken = Buffer.from(resp.continuationToken).toString('base64')
  }

  return {
    resources: resp.resources,
    continuationToken: parsedContinuationToken,
    hasMoreResults: resp.hasMoreResults,
  }
}

export { saveTrade, listTrades }
