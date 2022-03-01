import type { FeedOptions, FeedResponse, SqlQuerySpec } from '@azure/cosmos'
import { nanoid } from 'nanoid'
import { Trade, tradeSchema } from '../../entities'
import type { Logger } from '../../logger'
import { tradeClient } from './client'

const tradePk = (portfolioName: string) => `trade:${portfolioName}`
const tradeSk = (dt: Date) => dt.toISOString()
const tradeKey = () => nanoid()

const saveTrade = async (
  log: Logger,
  t: Trade,
  portfolioName: string,
): Promise<Trade> => {
  log.info(`saving trade ${t.symbol}`)

  t.pk = tradePk(portfolioName)
  t.sk = tradeSk(new Date())
  t.id = tradeKey()
  t.createdAt = new Date()
  t.value = t.amount * t.price

  await tradeSchema.parseAsync(t)
  await tradeClient.items.create(t)

  return t
}

const listTrades = async (
  log: Logger,
  portfolioName?: string,
  token?: string,
  limit = 50,
) => {
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
    const query: SqlQuerySpec = {
      query: 'select * from c where c.pk = @pk',
      parameters: [{ name: '@pk', value: tradePk(portfolioName) }],
    }
    resp = await tradeClient.items.query<Trade>(query, opts).fetchNext()
  } else {
    resp = await tradeClient.items.readAll<Trade>(opts).fetchNext()
  }

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

export { saveTrade, listTrades }
