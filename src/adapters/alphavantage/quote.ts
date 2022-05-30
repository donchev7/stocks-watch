import type { AxiosError, AxiosResponse } from 'axios'
import type { Logger } from '../../logger'
import clinet from './client'

type globalQuote = {
  'Global Quote': quoteResponse
}

type quoteResponse = {
  '01. symbol': string
  '02. open': string
  '03. high': string
  '04. low': string
  '05. price': string
  '06. volume': string
  '07. latest trading day': Date
  '08. previous close': string
  '09. change': string
  '10. change percent': string
}

type matchResponse = {
  bestMatches: symbolMatch[]
}

type symbolMatch = {
  '1. symbol': string
  '2. name': string
  '3. type': string
  '4. region': string
  '5. marketOpen': string
  '6. marketClose': string
  '7. timezone': string
  '8. currency': string
  '9. matchScore': string
}

const sleep = (milliSeconds: number) => new Promise((resolve) => setTimeout(resolve, milliSeconds))
const RETRIES = 4

const getPrice = async (log: Logger, symbol: string) => {
  let resp: AxiosResponse<globalQuote, any> | null = null
  let err: AxiosError | null = null

  for (let i = 1; i <= RETRIES; i++) {
    resp = await clinet
      .get<globalQuote>('/query', {
        params: { function: 'GLOBAL_QUOTE', symbol },
      })
      .catch((error) => {
        err = error
        return null
      })

    if (resp) {
      break
    }

    await sleep(1200)
  }

  if (!resp) {
    throw err ?? new Error(`getPrice timeout after ${RETRIES} retries`)
  }

  let price, tradingDay
  try {
    price = +resp.data['Global Quote']['05. price']
    tradingDay = new Date(resp.data['Global Quote']['07. latest trading day'])
  } catch (e) {
    log.error(`Error parsing price for ${symbol}`, e)
  }

  return {
    price,
    tradingDay,
  }
}

const searchSymbol = async (searchTerm: string) => {
  const resp = await clinet.get<matchResponse>('/query', {
    params: { function: 'SYMBOL_SEARCH', keywords: searchTerm },
  })

  const bestMatches = resp.data?.bestMatches ?? []

  return {
    matches: bestMatches.map((match) => ({
      searchScore: match['9. matchScore'],
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      tradingCurrency: match['8. currency'],
      market: match['4. region'],
    })),
  }
}

const symbolExists = async (symbol: string) => {
  const { matches } = await searchSymbol(symbol)

  return matches.findIndex((match) => match.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()) !== -1
}

export { getPrice, searchSymbol, symbolExists }
