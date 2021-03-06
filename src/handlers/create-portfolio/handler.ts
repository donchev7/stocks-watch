import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'
import type { Portfolio } from '../../entities'
import { maxMsg, minMsg, requiredString } from '../../helpers/validation'
import type { Logger } from '../../logger'

const portfolioRequest = z.object({
  name: z.string(requiredString('name')).min(1, minMsg('name')).max(100, maxMsg('name')),
})

const portfolioResponse = z.object({
  resource: z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date(),
  }),
})

type PortfolioRequest = z.infer<typeof portfolioRequest>

interface DB {
  savePortfolio(log: Logger, data: PortfolioRequest): Promise<Portfolio>
}

export const newHandler = (db: DB) => handler(db)

const handler = (db: DB) => {
  return async (context: Context, req: HttpRequest) => {
    const portfolio = await portfolioRequest.parseAsync(req.body)
    const resource = await db.savePortfolio(context.log, portfolio)

    return {
      status: 201,
      body: portfolioResponse.parse({ resource }),
    }
  }
}
