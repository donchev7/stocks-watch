import type { AzureFunction, Context, HttpRequest } from '@azure/functions'

const createPortfolio: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
) {
  context.log('HTTP trigger function processed a request.')
  const portfolioName = req.body?.portfolioName
  const username = req.body?.username
  let responseMessage: string

  if (username && portfolioName) {
    responseMessage =
      'Hello, ' + username + '. This ' + portfolioName + ' will be created.'
  } else {
    responseMessage =
      'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.'
  }

  //   const name = req.query.name || (req.body && req.body.name)
  //   const responseMessage = name
  //     ? 'Hello, ' + name + '. This HTTP triggered function executed successfully.'
  //     : 'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.'

  return {
    status: 201,
    body: responseMessage,
  }
}

export default createPortfolio
