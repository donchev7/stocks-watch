import { reporter } from '../../adapters/slack'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

export default errorHandler(newHandler(reporter), reporter)
