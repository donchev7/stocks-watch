import * as pulumui from '@pulumi/pulumi'

const config = new pulumui.Config()

const lo = {
  northeurope: 'ne',
  westeurope: 'we',
  francecentral: 'fc',
}

const env = pulumui.getStack()
export const location = config.require('location')

//@ts-ignore
export const shortLocation = lo[location]
if (!shortLocation) throw new Error('ConfigError: Unknown location provided')

export const prefix = `${shortLocation}-${env}`

export const tags = {
  managedBy: 'pulumi',
}
