import type { Context, HttpRequest } from '@azure/functions'
import { z } from 'zod'
import type { Trade } from '../../entities'
import type { Logger } from '../../logger'

const responseSchema = z.object({
  resources: z.array(
    z.object({
      symbol: z.string(),
      amount: z.number(),
      price: z.number().positive(),
      value: z.number(),
      type: z.string(),
      createdAt: z.string(),
    }),
  ),
  hasMoreResults: z.boolean().optional(),
  continuationToken: z.string().optional(),
})

const queryParamsSchema = z.object({
  portfolioName: z.string().optional(),
  continuationToken: z.string().optional(),
  limit: z
    .string()
    .transform((x) => +x)
    .optional(),
})

interface DB {
  listTrades(
    log: Logger,
    portfolioName?: string,
    token?: string,
    limit?: number,
  ): Promise<{
    resources: Trade[]
    hasMoreResults: boolean
    continuationToken: string | undefined
  }>
}

export const newHandler = (db: DB) => handler(db)

const handler = function (db: DB) {
  return async (context: Context, req: HttpRequest) => {
    const params = await queryParamsSchema.parseAsync(req.query)

    const entities = await db.listTrades(
      context.log,
      params.portfolioName,
      params.continuationToken,
      params.limit,
    )

    return {
      status: 200,
      body: responseSchema.parse(entities),
    }
  }
}
