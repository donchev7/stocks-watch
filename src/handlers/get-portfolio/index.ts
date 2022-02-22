import newRepository from '../../adapters/cosmos'
import { newHandler } from './handler'

// const run = (fn: AzureFunction, testS: string): AzureFunction => {
//   console.log(testS)

//   return (context: Context, req: HttpRequest) => {
//     context.log.info(req)

//     return fn(context, req)
//   }
// }

export default newHandler(newRepository())
