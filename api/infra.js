import endpoints from './endpoints'
// axios instance
import { $axiosInstace, network } from './index'

export function getTHORLastBlock() {
  return $axiosInstace.get(
    endpoints[network].SERVER_URL + 'lastblock'
  )
}

export function getBlockHeight(height) {
  return $axiosInstace.get(
    endpoints[network].SERVER_URL + `block?height=${height}`
  )
}

export function getQuote(params) {
  return $axiosInstace.get(
    endpoints[network].SERVER_URL + 'quote',
    {
      params,
    }
  )
}
