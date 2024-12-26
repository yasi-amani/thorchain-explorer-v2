import endpoints from './endpoints'
import { $axiosInstace, network } from './index'

export function getTendermintBlocks(block) {
  return $axiosInstace.get(
    endpoints[network].TENDERMINT_URL
    + `block_search?query="block.height>${block}"`,
  )
}

export function getTendermintLatestBlocks() {
  return $axiosInstace.get(
    endpoints[network].TENDERMINT_URL + 'blockchain',
  )
}
