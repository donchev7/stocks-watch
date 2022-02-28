import { CosmosClient } from '@azure/cosmos'
import * as cfg from '../../config'

const client = new CosmosClient({
  endpoint: cfg.cosmosEndpoint,
  key: cfg.cosmosKey,
})

const portfolioClient = client
  .database(cfg.cosmosDB)
  .container(cfg.portfolioTableName)

const tradeClient = client.database(cfg.cosmosDB).container(cfg.tradeTableName)
const assetClient = client.database(cfg.cosmosDB).container(cfg.assetTableName)

export { assetClient, tradeClient, portfolioClient }
