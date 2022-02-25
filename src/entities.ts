import * as z from 'zod'

const nameofFactory = <T>() => (name: keyof T) => name

export const tradeTypeSchema = z.enum(['purchase', 'sell'])

export const tradeSchema = z.object({
  id: z.string(),
  pk: z.string(),
  symbol: z.string(),
  amount: z.number().positive(),
  price: z.number().positive(),
  value: z.number().positive(),
  type: tradeTypeSchema,
  createdAt: z.date(),
  priceUpdatedAt: z.date(),
})

export const portfolioSchema = z.object({
  id: z.string(),
  pk: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trades: z.array(z.string()).optional(),
})

export type Trade = z.infer<typeof tradeSchema>
export type Portfolio = z.infer<typeof portfolioSchema>

export const PortfolioProps = nameofFactory<Portfolio>()
export const TradeProps = nameofFactory<Trade>()
