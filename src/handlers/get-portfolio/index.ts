import { portfolioDAO, assetDAO } from '../../adapters/cosmos'
import { newHandler } from './handler'

// const run = (fn: AzureFunction, testS: string): AzureFunction => {
//   console.log(testS)

//   return (context: Context, req: HttpRequest) => {
//     context.log.info(req)

//     return fn(context, req)
//   }
// }

const db = {
  getPortfolio: portfolioDAO.getPortfolio,
  getAssets: assetDAO.getAssets,
}

export default newHandler(db)
