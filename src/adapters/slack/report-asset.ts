import clinet from './client'
import { slackWebHookNotification } from '../../config'
import type { PriceChangeNotification } from '../../entities'

const reportAssetPriceChange = async (notfication: PriceChangeNotification) => {
  const header = `a price change occured ${notfication.asset.symbol} is ${notfication.isUp ? 'up' : 'down'}`
  const maxChar = 35000
  const dateTimeStr = new Date().toISOString()
  const message = `${dateTimeStr} - ${header}

  ${JSON.stringify(notfication.asset, null, 2)}
  `.slice(0, maxChar)

  await clinet.post(slackWebHookNotification, { text: message }).catch(console.error)
}

export { reportAssetPriceChange }
