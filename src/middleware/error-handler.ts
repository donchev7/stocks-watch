import type { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { ZodError } from 'zod'

export const errorHandler = (fn: AzureFunction): AzureFunction => {
  return async (context: Context, req: HttpRequest) => {
    try {
      return await fn(context, req)
    } catch (err) {
      if (err instanceof ZodError) {
        return {
          status: 400,
          body: {
            error: {
              msg: 'bad data'
            }
          }
        }
      }

      context.log.error('error occured', err)

      return {
        status: 500,
        body: {
          error: {
            msg: 'internal server error'
          }
        }
      }
    }
  }
}
