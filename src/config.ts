import * as env from 'env-var'

const environment = env.get('NODE_ENV').required().asString()

const isDevelopment = environment === 'development'
const cosmosEndpoint = env.get('COSMOS_ENDPOINT').required().asString()
const cosmosKey = env.get('COSMOS_PRIMARY_KEY').required().asString()
const cosmosDB = env.get('COSMOS_DB_NAME').required().asString()
const portfolioTableName = env.get('COSMOS_PORTFOLIO_TABLE_NAME').required().asString()
const tradeTableName = env.get('COSMOS_TRADE_TABLE_NAME').required().asString()
const assetTableName = env.get('COSMOS_ASSET_TABLE_NAME').required().asString()

const alphaVantageApiKey = env.get('ALPHA_VANTAGE_API_KEY').required().asString()
const alphaVantageApiUrl = env.get('ALPHA_VANTAGE_API_URL').required().asString()

const slackWebHook = env.get('SLACK_WEBHOOK_URL').required().asString()

export {
  alphaVantageApiKey,
  alphaVantageApiUrl,
  isDevelopment,
  cosmosEndpoint,
  cosmosKey,
  cosmosDB,
  tradeTableName,
  portfolioTableName,
  assetTableName,
  slackWebHook
}
