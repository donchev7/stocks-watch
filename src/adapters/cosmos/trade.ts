import { nanoid } from 'nanoid'
import { Trade, tradeSchema } from '../../entities'
import type { Logger } from '../../logger'
import { tradeClient } from './client'

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
  await tradeClient.items.create(t)

  return t
}

export { saveTrade }
