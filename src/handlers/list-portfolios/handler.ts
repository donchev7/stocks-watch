import type { Context, HttpRequest } from '@azure/functions'
import { z } from 'zod'
import type { Portfolio } from '../../entities'
import type { Logger } from '../../logger'

const responseSchema = z.object({
  resources: z.array(
    z.object({
      name: z.string(),
      createdAt: z.string(),
      updatedAt: z.string()
    })
  ),
  hasMoreResults: z.boolean().optional(),
  continuationToken: z.string().optional()
})

const queryParamsSchema = z.object({
  continuationToken: z.string().optional(),
  limit: z
    .string()
    .transform((x) => +x)
    .optional()
})

interface DB {
  listPortfolios(log: Logger, token?: string, limit?: number): Promise<{ resources: Portfolio[] }>
}

export const newHandler = (db: DB) => handler(db)

const handler = function (db: DB) {
  return async (context: Context, req: HttpRequest) => {
    const params = await queryParamsSchema.parseAsync(req.query)

    const entities = await db.listPortfolios(context.log, params.continuationToken, params.limit)

    return {
      status: 200,
      body: responseSchema.parse(entities)
    }
  }
}
