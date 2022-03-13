import type { Context, HttpRequest } from '@azure/functions'
import type { Logger } from '../logger'

const log = {
  info: (...args: any) => console.info(...args),
  verbose: (...args: any) => console.info(...args),
  warn: (...args: any) => console.warn(...args),
  error: (...args: any) => console.error(...args),
}

const l = function (...args: any) {
  console.log(...args)
}

const TestLogger: Logger = Object.assign(l, log)

const testContext = (bindingData?: object): Context => ({
  traceContext: {
    traceparent: null,
    tracestate: null,
    attributes: null,
  },
  done: (err?: Error | string | null, result?: any) => console.log(err, result),
  invocationId: 'testInvocation',
  executionContext: {
    invocationId: 'testInvocation',
    functionName: 'testFunction',
    functionDirectory: './here',
    retryContext: null,
  },
  bindings: {},
  log: TestLogger,
  bindingData: { invocationId: 'testInvocation', ...(bindingData ?? {}) },
  bindingDefinitions: [
    {
      name: 'test',
      direction: 'in',
      type: 'httpTrigger',
    },
  ],
})

type reqInput = {
  body?: HttpRequest['body']
  query?: HttpRequest['query']
}

const testRequest = (input?: reqInput): HttpRequest => ({
  method: 'GET',
  url: 'https://test.is',
  headers: { test: 'header' },
  query: input?.query ?? {},
  params: {},
  body: input?.body ?? {},
})

const testReporter = () => ({
  reportError: async (_: Error) => {
    console.log('testReporter called')
  },
})

export { testContext, testRequest, testReporter }
