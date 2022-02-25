import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'
import { Trade, tradeTypeSchema } from '../../entities'
import type { Logger } from '../../logger'

const tradeRequest = z.object({
  portfolioId: z.string(),
  symbol: z.string(),
  amount: z.number().positive(),
  price: z.number().positive(),
  type: tradeTypeSchema,
})

const tradeResponse = z.object({
  id: z.string(),
  symbol: z.string(),
  amount: z.number().positive(),
  price: z.number().positive(),
  value: z.number().positive(),
  createdAt: z.date(),
  priceUpdatedAt: z.date(),
})

interface DB {
  saveTrade(log: Logger, data: Trade, portfolioId: string): Promise<Trade>
}

export const newHandler = (db: DB) => createTrade(db)

const createTrade = function (db: DB) {
  return async (context: Context, req: HttpRequest) => {
    const tradeReq = await tradeRequest.parseAsync(req.body)
    const { portfolioId, ...rest } = tradeReq

    const entity = await db.saveTrade(
      context.log,
      rest as Trade,
      tradeReq.portfolioId,
    )

    return {
      status: 201,
      body: tradeResponse.parse(entity),
    }
  }
}
