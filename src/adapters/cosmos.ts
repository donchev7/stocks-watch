import { CosmosClient } from '@azure/cosmos'

const endpoint = 'https://your-account.documents.azure.com'
const key = '<database account masterkey>'
const client = new CosmosClient({ endpoint, key })

client.database('asd').container
