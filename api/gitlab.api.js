import endpoints from './endpoints'
// axios instance
import { $axiosInstace } from './index'

export function getEthTokenList() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].GITLAB_THORNODE_RAW + '/common%2Ftokenlist%2Fethtokens%2Feth_mainnet_latest.json/raw?ref=develop'
  )
}
export function getDefaultConfig() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].GITLAB_THORNODE_RAW + '/config%2Fdefault.yaml/raw?ref=develop'
  )
}