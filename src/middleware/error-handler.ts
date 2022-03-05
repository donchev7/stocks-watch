import type { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { ZodError } from 'zod'
import { reportError } from '../helpers/report-error'

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
      await reportError(err as Error)
    } finally {
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
