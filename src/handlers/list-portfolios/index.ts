import { portfolioDAO } from '../../adapters/cosmos'
import { newHandler } from './handler'

export default newHandler(portfolioDAO)
