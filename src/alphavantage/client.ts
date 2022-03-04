import axios from 'axios'
import {
  alphaVantageApiKey,
  alphaVantageApiUrl,
  isDevelopment,
} from '../config'

const clinet = axios.create({
  timeout: 7000,
  baseURL: alphaVantageApiKey,
  params: { apiKey: alphaVantageApiUrl },
})

clinet.interceptors.request.use((req) => {
  const request = { ...req }
  request.params['apiKey'] = undefined

  if (isDevelopment) {
    console.log('starting request', JSON.stringify(request, null, 2))
  }

  return req
})

clinet.interceptors.response.use((resp) => {
  const { config, request, ...rest } = resp

  if (isDevelopment) {
    console.log('got response:', JSON.stringify(rest, null, 2))
  }

  return resp
})

export default clinet
