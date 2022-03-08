import * as fs from 'fs'
import * as pulumi from '@pulumi/pulumi'
import type * as azure from '@pulumi/azure'
import * as cfg from './config'
import { createDB, createTable } from './cosmosdb'

const infra = new pulumi.StackReference(`neurocode/cosmosdb/live`)
const cosmodb = infra.getOutput('cosmosdb') as pulumi.Output<azure.cosmosdb.Account>

const db = createDB(cosmodb)
const portfolioTable = createTable('portfolio', cosmodb, db)
const tradeTable = createTable('trade', cosmodb, db)
const assetTable = createTable('asset', cosmodb, db)
const notificationTable = createTable('notification', cosmodb, db)

const buildTestEnvFile = (envs: any) => {
  const settings = {
    IsEncrypted: false,
    Values: {
      FUNCTIONS_WORKER_RUNTIME: 'node',
      AzureWebJobsStorage: '',
      NODE_ENV: 'development',
      ALPHA_VANTAGE_API_KEY: envs.alphaVantageApiKey,
      ALPHA_VANTAGE_API_URL: envs.alphaVantageApiUrl,
      SLACK_WEBHOOK_URL: envs.slackWebhookUrlErrors,
      COSMOS_ENDPOINT: envs.endpoint,
      COSMOS_PRIMARY_KEY: envs.primaryKey,
      COSMOS_DB_NAME: envs.dbName,
      COSMOS_PORTFOLIO_TABLE_NAME: envs.portfolioTableName,
      COSMOS_TRADE_TABLE_NAME: envs.tradeTableName,
      COSMOS_ASSET_TABLE_NAME: envs.assetTableName,
      COSMOS_NOTIFICATION_TABLE_NAME: envs.notificationTable,
      COSMOS_CONNECTION_STRING: `AccountEndpoint=${envs.endpoint};AccountKey=${envs.primaryKey};`,
    },
  }

  return JSON.stringify(settings)
}

const writeEnvFile = () => {
  if (cfg.prefix.includes('live')) return

  pulumi
    .all([
      cosmodb.endpoint,
      cosmodb.primaryKey,
      db.name,
      portfolioTable.name,
      tradeTable.name,
      assetTable.name,
      notificationTable.name,
      cfg.alphaVantageApiKey,
      cfg.alphaVantageApiUrl,
      cfg.slackWebhookUrlErrors,
    ])
    .apply(
      ([
        endpoint,
        primaryKey,
        dbName,
        portfolioTableName,
        tradeTableName,
        assetTableName,
        notificationTable,
        alphaVantageApiKey,
        alphaVantageApiUrl,
        slackWebhookUrlErrors,
      ]) => {
        fs.writeFileSync(
          '../src/handlers/local.settings.json',
          buildTestEnvFile({
            endpoint,
            primaryKey,
            dbName,
            portfolioTableName,
            tradeTableName,
            assetTableName,
            notificationTable,
            alphaVantageApiKey,
            alphaVantageApiUrl,
            slackWebhookUrlErrors,
          }),
        )
      },
    )
}

writeEnvFile()
