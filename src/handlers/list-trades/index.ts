import { tradeDAO } from '../../adapters/cosmos'
import { newHandler } from './handler'

export default newHandler(tradeDAO)
