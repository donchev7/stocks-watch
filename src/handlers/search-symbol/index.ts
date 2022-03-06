import { quote } from '../../adapters/alphavantage'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

export default errorHandler(newHandler(quote))
