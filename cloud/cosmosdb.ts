import * as azure from '@pulumi/azure'
import type { Output } from '@pulumi/pulumi'
import * as cfg from './config'

const dbName = 'stocks'

export const createDB = (cosmosAccount: Output<azure.cosmosdb.Account>) =>
  new azure.cosmosdb.SqlDatabase(`${cfg.prefix}-${dbName}`, {
    name: `${cfg.prefix}-${dbName}`,
    resourceGroupName: cosmosAccount.resourceGroupName,
    accountName: cosmosAccount.name,
  })

export const createTable = (
  tableName: string,
  cosmosAccount: Output<azure.cosmosdb.Account>,
  db: azure.cosmosdb.SqlDatabase,
) =>
  new azure.cosmosdb.SqlContainer(`${cfg.prefix}-${dbName}-${tableName}`, {
    name: `${cfg.prefix}-${dbName}-${tableName}`,
    resourceGroupName: cosmosAccount.resourceGroupName,
    accountName: cosmosAccount.name,
    databaseName: db.name,
    partitionKeyPath: '/pk',
    partitionKeyVersion: 2,
    indexingPolicy: {
      indexingMode: 'Consistent',
      includedPaths: [
        {
          path: '/sk/*',
        },
      ],
      excludedPaths: [
        {
          path: '/*',
        },
      ],
    },
  })
