import { assetDAO, portfolioDAO } from '../../adapters/cosmos'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

const db = {
  getPortfolio: portfolioDAO.getPortfolio,
  getAssets: assetDAO.getAssets
}

export default errorHandler(newHandler(db))
