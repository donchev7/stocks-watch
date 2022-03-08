import { assetDAO, portfolioDAO } from '../../adapters/cosmos'
import { reporter } from '../../adapters/slack'
import { errorHandler } from '../../middleware/error-handler'
import { newHandler } from './handler'

const db = {
  getPortfolio: portfolioDAO.getPortfolio,
  getAssets: assetDAO.getAssets,
}

export default errorHandler(newHandler(db), reporter)
