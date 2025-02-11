import endpoints from './endpoints'
import { $axiosInstace } from './index'

export function getDashboardData() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/dashboardData'
  )
}

export function getDashboardPlots() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/dashboardPlots'
  )
}

export function getExraNodesInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/extraNodesInfo'
  )
}

export function getSaversInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/saversInfo'
  )
}

export function getChainsHeight() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/chainsHeight'
  )
}

export function getPoolsHistory(period = '') {
  if (period === 'day') {
    period = ''
  }
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/historyPools' + period
  )
}

export function getOldPoolsHistory(period = '') {
  if (period === 'day') {
    period = ''
  }
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/oldHistoryPools' + period
  )
}

export function getServerTx(txid) {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + `tx/${txid}`
  )
}

export function getRunePoolsInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/runePools'
  )
}

export function getOldRunePools() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/oldRunePool'
  )
}

export function getOldRunePoolProvidersInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/oldRunePoolProviders'
  )
}

export function getRunePoolProvidersInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/runePoolProviders'
  )
}

export function getBorrowersInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/borrowers'
  )
}

export function getSwapsWeekly() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/swapsWeekly'
  )
}

export function getStatsDaily() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/statsDaily'
  )
}

export function getFeesRewardsMonthly() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/feesRewardsMonthly'
  )
}

export function getAffiliateSwapsByWallet() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/affiliateSwapsByWallet'
  )
}

export function getAffiliateSwapsWeekly() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/affiliateSwapsWeekly'
  )
}

export function getAffiliateSwapsDaily() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/affiliateSwapsDaily'
  )
}

export function getnodeOverview() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/nodeOverview'
  )
}

export function getAffiliateDaily() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/affiliateDaily'
  )
}

export function getActions(params) {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'actions',
    { params }
  )
}

export function getCoinMarketInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/coinmarketCap'
  )
}

export function getNodesInfo() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/nodesInfo'
  )
}

export function getTopSwaps() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/swaps'
  )
}

export function getTopSwapsWeekly() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/swapsTopWeekly'
  )
}

export function getTopSwapsMonthly() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/swapsTopMonthly'
  )
}

export function getEarnings() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/rawEarnings'
  )
}

export function getNodes() {
  return $axiosInstace.get(endpoints[process.env.NETWORK].SERVER_URL + 'nodes')
}

export function getNetworkAllocation() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/networkAllocation'
  )
}

export function getReserveHistory() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/reserve'
  )
}

export function getBurnedBlocks() {
  return $axiosInstace.get(
    endpoints[process.env.NETWORK].SERVER_URL + 'api/burned'
  )
}

export function getExecutionQuality() {
  return $axiosInstace.get(
    'https://flipsidecrypto.xyz/api/v1/queries/6e18d4c9-3959-4791-a3b2-92a8f27cc120/data/latest'
  )
}
export function getDailyVolume() {
  return $axiosInstace.get(
    'https://flipsidecrypto.xyz/api/v1/queries/19fe66b1-38a5-4c1f-b91a-75da47cebe3f/data/latest'
  )
}
export function getUniqueSwappers() {
  return $axiosInstace.get(
    'https://flipsidecrypto.xyz/api/v1/queries/581abc71-ae73-4bcf-bd4f-8457e588a7c8/data/latest'
  )
}
export function getDailyDexVolume() {
  return $axiosInstace.get(
    'https://flipsidecrypto.xyz/api/v1/queries/31594268-05fe-4931-8a03-6c0682feaec4/data/latest'
  )
}
export function getModuleBalances() {
  return $axiosInstace.get(
    'https://flipsidecrypto.xyz/api/v1/queries/2a6fcc3f-390b-42fb-99e6-59e54e26cde4/data/latest'
  )
}
export function getThorchainAddresses() {
  return $axiosInstace.get(
    'https://flipsidecrypto.xyz/api/v1/queries/0fb08229-627a-4472-afb5-c78b48293aed/data/latest'
  )
}
