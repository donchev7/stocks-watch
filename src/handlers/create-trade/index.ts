import { quote } from '../../adapters/alphavantage'
import { tradeDAO } from '../../adapters/cosmos'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

export default errorHandler(newHandler(tradeDAO, quote))
