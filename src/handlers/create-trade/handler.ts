import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'
import { Trade, tradeTypeSchema } from '../../entities'
import { requiredNumber, requiredString } from '../../helpers/validation'
import type { Logger } from '../../logger'

const tradeResponse = z.object({
  resource: z.object({
    id: z.string(),
    symbol: z.string(),
    amount: z.number().transform((x) => Math.abs(x)),
    price: z.number().transform((x) => Math.abs(x)),
    value: z.number(),
    createdAt: z.date(),
  }),
})

interface DB {
  saveTrade(log: Logger, data: Partial<Trade>, portfolioName: string): Promise<Trade>
}

interface API {
  symbolExists(symbol: string): Promise<boolean>
}

export const newHandler = (db: DB, api: API) => handler(db, api)

const handler = function (db: DB, api: API) {
  const tradeRequest = z.object({
    portfolioName: z.string(requiredString('portfolioName')),
    symbol: z
      .string(requiredString('symbol'))
      .transform((s) => s.toLocaleUpperCase())
      .refine(async (s) => await api.symbolExists(s), {
        message: 'invalid symbol',
      }),
    amount: z.number(requiredNumber('amount')).positive({ message: 'amount must be positive' }),
    price: z.number(requiredNumber('price')).positive({ message: 'price must be positive' }),
    type: tradeTypeSchema,
  })

  return async (context: Context, req: HttpRequest) => {
    const tradeReq = await tradeRequest.parseAsync(req.body)
    const { portfolioName, ...rest } = tradeReq

    if (rest.type === 'sell') {
      rest.amount *= -1
    }

    const resource = await db.saveTrade(context.log, rest, portfolioName)

    return {
      status: 201,
      body: tradeResponse.parse({ resource }),
    }
  }
}
