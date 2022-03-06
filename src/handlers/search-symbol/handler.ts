import type { Context, HttpRequest } from '@azure/functions'
import * as z from 'zod'

const symbolTerm = z.object({
  searchTerm: z.string().min(1).max(100)
})

const responseSchema = z.object({
  matches: z.array(
    z.object({
      searchScore: z.string(),
      symbol: z.string(),
      name: z.string(),
      type: z.string(),
      tradingCurrency: z.string(),
      market: z.string()
    })
  )
})
export type Response = z.infer<typeof responseSchema>

interface API {
  searchSymbol(symbolTerm: string): Promise<Response>
}

export const newHandler = (api: API) => handler(api)

const handler = function (api: API) {
  return async (_: Context, req: HttpRequest) => {
    const params = await symbolTerm.parseAsync(req.query)
    const resp = await api.searchSymbol(params.searchTerm)

    return {
      status: 200,
      body: responseSchema.parse(resp)
    }
  }
}
