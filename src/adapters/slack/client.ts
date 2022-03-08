import axios from 'axios'
import { isDevelopment } from '../../config'

const clinet = axios.create({
  timeout: 7000,
})

clinet.interceptors.request.use((req) => {
  if (isDevelopment) {
    console.log('sending slack message', JSON.stringify(req.data?.text ?? {}, null, 2))
  }

  return req
})

clinet.interceptors.response.use((resp) => {
  const { config, request, ...rest } = resp

  if (isDevelopment) {
    console.log('got slack response', JSON.stringify(rest, null, 2))
  }

  return resp
})

export default clinet
