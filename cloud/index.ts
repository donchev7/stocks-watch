import * as fs from 'fs'
import * as pulumi from '@pulumi/pulumi'
import type * as azure from '@pulumi/azure'
import * as cfg from './config'
import { createDB, createTable } from './cosmosdb'

const infra = new pulumi.StackReference(`neurocode/cosmosdb/live`)
const cosmodb = infra.getOutput('cosmosdb') as pulumi.Output<
  azure.cosmosdb.Account
>

const db = createDB(cosmodb)
const table = createTable(cosmodb, db)

const buildTestEnvFile = (envs: any) => {
  const settings = {
    IsEncrypted: false,
    Values: {
      FUNCTIONS_WORKER_RUNTIME: 'node',
      AzureWebJobsStorage: '',
      NODE_ENV: 'development',
      COSMOS_ENDPOINT: envs.endpoint,
      COSMOS_PRIMARY_KEY: envs.primaryKey,
      COSMOS_DB_NAME: envs.dbName,
      COSMOS_TABLE_NAME: envs.tableName,
    },
  }

  return JSON.stringify(settings)
}

const writeEnvFile = () => {
  if (cfg.prefix.includes('live')) return

  pulumi
    .all([cosmodb.endpoint, cosmodb.primaryKey, db.name, table.name])
    .apply(([endpoint, primaryKey, dbName, tableName]) => {
      fs.writeFileSync(
        '../src/handlers/local.settings.json',
        buildTestEnvFile({
          endpoint,
          primaryKey,
          dbName,
          tableName,
        }),
      )
    })
}

writeEnvFile()
