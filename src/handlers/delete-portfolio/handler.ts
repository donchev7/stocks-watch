import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'
import type { Logger } from '../../logger'

const portfolioName = z.string().min(1).max(100)

interface DB {
  deletePortfolio(log: Logger, name: string): Promise<void>
}

export const newHandler = (db: DB) => handler(db)

const handler = function (db: DB) {
  return async (context: Context, _: HttpRequest) => {
    const nameInput = context.bindingData['name']
    const pName = await portfolioName.parseAsync(nameInput)

    await db.deletePortfolio(context.log, pName)

    return {
      status: 204,
    }
  }
}
