import axios from 'axios'
import { isDevelopment, slackWebHook } from '../config'

const getStack = (stack?: string) => `\`\`\`
  ${JSON.stringify(stack, null, 2)}
\`\`\`
`

const reportError = async (error: Error) => {
  if (isDevelopment) {
    return
  }
  const stack = getStack(error.stack).slice(0, 1000)
  const dateTimeStr = new Date().toISOString()
  const message = `${dateTimeStr} - an error occured in stocks-watch

  ${stack}
  `

  return axios.post(slackWebHook, { text: message }).catch(console.error)
}

export { reportError }
