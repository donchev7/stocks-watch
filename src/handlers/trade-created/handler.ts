import type { Context } from '@azure/functions'
import { Trade, tradeSchema } from '../../entities'
import type { Logger } from '../../logger'

interface DB {
  upsertAsset(log: Logger, data: Trade): Promise<void>
}

export const newHandler = (db: DB) => cosmosDBTrigger(db)

const cosmosDBTrigger = (db: DB) => {
  return async (context: Context, trades: Trade[]): Promise<void> => {
    for (const t of trades) {
      // because cosmosDB stores dates as strings
      const entity = { ...t, createdAt: new Date(t.createdAt) }

      const trade = await tradeSchema.parseAsync(entity)
      await db.upsertAsset(context.log, trade)
    }
  }
}
