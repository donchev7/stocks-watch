import type { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { ZodError } from 'zod'

interface ErrorReporter {
  reportError(err: Error): Promise<void>
}

export const errorHandler = (fn: AzureFunction, reporter: ErrorReporter): AzureFunction => {
  return async (context: Context, req: HttpRequest) => {
    try {
      return await fn(context, req)
    } catch (err) {
      context.log.error('error occured', err)
      await reporter.reportError(err as Error)

      if (err instanceof ZodError) {
        return {
          status: 400,
          body: {
            error: {
              msg: 'bad data',
              reason: err.issues.shift()?.message,
            },
          },
        }
      }

      return {
        status: 500,
        body: {
          error: {
            msg: 'internal server error',
          },
        },
      }
    }
  }
}
