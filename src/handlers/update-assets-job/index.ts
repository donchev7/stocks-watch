import { assetDAO } from '../../adapters/cosmos'
import { quote } from '../../adapters/alphavantage'
import { newHandler } from './handler'

// const run = (fn: AzureFunction, testS: string): AzureFunction => {
//   console.log(testS)

//   return (context: Context, req: HttpRequest) => {
//     context.log.info(req)

//     return fn(context, req)
//   }
// }

// 0 30 7 * * 1-5
export default newHandler(assetDAO, quote)
