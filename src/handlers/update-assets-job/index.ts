import { assetDAO, notificationDAO } from '../../adapters/cosmos'
import { quote } from '../../adapters/alphavantage'
import { newHandler } from './handler'
import { errorHandler } from '../../middleware/error-handler'
import { reporter } from '../../adapters/slack'
// 0 30 7 * * 1-5
export default errorHandler(newHandler({ ...assetDAO, ...notificationDAO }, quote), reporter)
