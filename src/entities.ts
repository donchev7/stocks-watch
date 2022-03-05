import * as z from 'zod'

const nameofFactory = <T>() => (name: keyof T) => name

export const tradeTypeSchema = z.enum(['buy', 'sell'])

const meta = {
  id: z.string(),
  pk: z.string(),
  sk: z.string()
}

export const metaFields = Object.fromEntries(Object.entries(meta).map(([key, _]) => [key, true]))

export const assetSchema = z.object({
  ...meta,
  symbol: z.string(),
  price: z.number().positive(),
  amount: z.number(),
  investmentValue: z.number(),
  currentValue: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const portfolioSchema = z.object({
  ...meta,
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const tradeSchema = z.object({
  ...meta,
  symbol: z.string(),
  amount: z.number(),
  price: z.number().positive(),
  value: z.number(),
  type: tradeTypeSchema,
  createdAt: z.date()
})

export type Trade = z.infer<typeof tradeSchema>
export type Asset = z.infer<typeof assetSchema>
export type Portfolio = z.infer<typeof portfolioSchema>

export const PortfolioProps = nameofFactory<Portfolio>()
export const TradeProps = nameofFactory<Trade>()
export const AssetProps = nameofFactory<Asset>()
