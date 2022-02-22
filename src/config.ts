import * as env from 'env-var'

const environment = env.get('NODE_ENV').required().asString()

const isDevelopment = environment === 'development'
const cosmosEndpoint = env.get('COSMOS_ENDPOINT').required().asString()
const cosmosKey = env.get('COSMOS_PRIMARY_KEY').required().asString()
const cosmosDB = env.get('COSMOS_DB_NAME').required().asString()
const cosmosTable = env.get('COSMOS_TABLE_NAME').required().asString()

export { isDevelopment, cosmosEndpoint, cosmosKey, cosmosDB, cosmosTable }
