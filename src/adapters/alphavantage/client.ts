import axios from 'axios'
import { alphaVantageApiKey, alphaVantageApiUrl, isDevelopment } from '../../config'

const clinet = axios.create({
  timeout: 7000,
  baseURL: alphaVantageApiUrl,
})

clinet.defaults.params = { apikey: alphaVantageApiKey }

clinet.interceptors.request.use((req) => {
  if (isDevelopment) {
    console.log('sending alphavantage request', JSON.stringify(req, null, 2))
  }

  return req
})

clinet.interceptors.response.use((resp) => {
  const { config, request, ...rest } = resp

  if (isDevelopment) {
    console.log('got alphavantage response:', JSON.stringify(rest, null, 2))
  }

  return resp
})

export default clinet
