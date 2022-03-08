import clinet from './client'
import { slackWebHook } from '../../config'

const getStack = (stack?: string) => `\`\`\`
  ${JSON.stringify(stack, null, 2)}
\`\`\`
`

const reportError = async (error: Error) => {
  const maxChar = 35000
  const stack = getStack(error.stack)
  const dateTimeStr = new Date().toISOString()
  const message = `${dateTimeStr} - an error occured in stocks-watch

  ${stack}
  `.slice(0, maxChar)

  await clinet.post(slackWebHook, { text: message }).catch(console.error)
}

export { reportError }
