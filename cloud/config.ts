import * as pulumui from '@pulumi/pulumi'

const config = new pulumui.Config()

const lo = {
  northeurope: 'ne',
  westeurope: 'we',
  francecentral: 'fc',
}

const env = pulumui.getStack()
export const location = config.require('location')
export const alphaVantageApiKey = config.requireSecret('alphaVantageApiKey')
export const alphaVantageApiUrl = config.requireSecret('alphaVantageApiUrl')
export const slackWebhookUrlErrors = config.requireSecret('slackWebhookUrlErrors')

//@ts-ignore
export const shortLocation = lo[location]
if (!shortLocation) throw new Error('ConfigError: Unknown location provided')

export const prefix = `${shortLocation}-${env}`

export const tags = {
  managedBy: 'pulumi',
}
