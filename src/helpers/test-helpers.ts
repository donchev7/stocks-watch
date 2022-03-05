import type { Context } from '@azure/functions'
import type { Logger } from '../logger'

const log = {
  info: (...args: any) => console.info(...args),
  verbose: (...args: any) => console.info(...args),
  warn: (...args: any) => console.warn(...args),
  error: (...args: any) => console.error(...args)
}

const l = function (...args: any) {
  console.log(...args)
}

const TestLogger: Logger = Object.assign(l, log)

const testContext = (): Context => ({
  traceContext: {
    traceparent: null,
    tracestate: null,
    attributes: null
  },
  done: (err?: Error | string | null, result?: any) => console.log(err, result),
  invocationId: 'testInvocation',
  executionContext: {
    invocationId: 'testInvocation',
    functionName: 'testFunction',
    functionDirectory: './here',
    retryContext: null
  },
  bindings: {},
  log: TestLogger,
  bindingData: { invocationId: 'testInvocation' },
  bindingDefinitions: [
    {
      name: 'test',
      direction: 'in',
      type: 'httpTrigger'
    }
  ]
})

export { testContext }
