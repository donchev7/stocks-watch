import faker from '@faker-js/faker'
import type { Asset, Portfolio, PriceChangeNotification, Trade, TradeType } from '../entities'

export const fakePortfolio = (portfolio?: Partial<Portfolio>) => ({
  name: faker.random.alphaNumeric(10),
  createdAt: faker.date.recent().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...portfolio,
})

export const fakeTrade = (trade?: Partial<Trade>) => ({
  symbol: 'MSFT',
  amount: 10,
  price: 10,
  value: 100,
  type: 'buy' as TradeType,
  createdAt: faker.date.recent().toISOString(),
  ...trade,
})

export const fakeAsset = (asset?: Partial<Asset>) => ({
  symbol: fakeTrade().symbol,
  price: fakeTrade().price,
  amount: fakeTrade().amount,
  investmentValue: fakeTrade().value,
  lastPriceCheckValue: fakeTrade().value,
  lastMonthlyCheckValue: fakeTrade().value,
  currentValue: fakeTrade().value,
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  ...asset,
})

export const fakePriceNotification = (p?: PriceChangeNotification): PriceChangeNotification => ({
  id: faker.random.alphaNumeric(10),
  pk: 'pk',
  sk: 'sk',
  type: 'priceChange',
  isUp: true,
  asset: fakeAsset(),
  ...p,
})
