import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'
import type { Portfolio } from '../../entities'
import type { Logger } from '../../logger'

const portfolioResponse = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trades: z.array(z.string()).optional(),
})

const portfolioName = z.string().min(1).max(100)

interface DB {
  getPortfolio(log: Logger, name: string): Promise<Portfolio>
}

export const newHandler = (db: DB) => getPortfolio(db)

const getPortfolio = function (db: DB) {
  return async (context: Context, _: HttpRequest) => {
    const nameInput = context.bindingData['name']
    const pName = await portfolioName.parseAsync(nameInput)

    const entity = await db.getPortfolio(context.log, pName)

    return {
      status: 200,
      body: portfolioResponse.parse(entity),
    }
  }
}
