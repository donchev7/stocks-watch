import * as z from 'zod'

const tradeType = z.enum(['purchase', 'sell'])

export const tradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  amount: z.number().positive(),
  type: tradeType,
  createdAt: z.date(),
  value: z.number().positive(),
  lastPrice: z.number().positive(),
  lastPriceAt: z.date(),
})

export const portfolioSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trades: z.array(z.string()).optional(),
})

export type Trade = z.infer<typeof tradeSchema>
export type Portfolio = z.infer<typeof portfolioSchema>
