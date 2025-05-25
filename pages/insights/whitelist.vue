<template>
  <div>
    <div class="token-whitelist">
      <div>
        <div class="header">
          <div class="title-section">
            <div class="title-with-info-container">
              <div class="title-with-info">
                <button
                  class="info-button"
                  :class="{ active: showInformation }"
                  @click="toggleInfo"
                  title="Show information"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
              </div>

              <card v-if="showInformation" class="info-section">
                This is a list of the tokens that are whitelisted for liquidity
                pool creation on THORChain. These assets may or may not have a
                pool created already. New pools can be created by staging a pool
                with at least 10k in RUNE and the equivalent value of the token.
                Pools transition from Staged to Active after a few days. Active
                pools will revert to Staged with less than 10k RUNE in
                liquidity.
              </card>
            </div>

            <div class="filter-btns">
              <button
                class="filter-button"
                :class="{ active: currentChain === 'ETH' }"
                @click="setChainFilter('ETH')"
              >
                ETH
              </button>
              <button
                class="filter-button"
                :class="{ active: currentChain === 'BSC' }"
                @click="setChainFilter('BSC')"
              >
                BSC
              </button>
              <button
                class="filter-button"
                :class="{ active: currentChain === 'AVAX' }"
                @click="setChainFilter('AVAX')"
              >
                AVAX
              </button>
              <button
                class="filter-button"
                :class="{ active: currentChain === 'BASE' }"
                @click="setChainFilter('BASE')"
              >
                BASE
              </button>
              <button
                class="filter-button"
                :class="{ active: currentChain === 'ALL' }"
                @click="setChainFilter('ALL')"
              >
                ALL
              </button>
            </div>
          </div>

          <div class="search-container">
            <div id="nodes-search-container">
              <input
                v-model="searchTerm"
                placeholder="Search by name, symbol, address, or pool status"
                class="search-input"
              />
              <SearchIcon class="search-icon" />
            </div>
          </div>
        </div>

        <div class="token-grid">
          <card
            v-for="tokenItem in filteredTokenItems"
            :key="tokenItem.address + tokenItem.chain"
          >
            <div class="token-info">
              <div class="token-header">
                <div class="name-token">
                  <asset-icon :asset="getAssetString(tokenItem)" />
                  <h3>
                    {{ tokenItem.name || tokenItem.symbol || `Unknown Token` }}
                  </h3>
                </div>
                <div class="badge-container">
                  <span
                    class="mini-bubble"
                    :class="badgeColorClass(tokenItem.chain)"
                  >
                    {{ tokenItem.chain }}
                  </span>
                  <span
                    v-if="tokenItem.poolStatus"
                    class="pool-badge"
                    :class="tokenItem.poolStatus.toLowerCase()"
                  >
                    {{ tokenItem.poolStatus }}
                    <span v-if="tokenItem.runeDepth" class="rune-depth">
                      <asset-icon asset="THOR.RUNE" height="15px" />
                      {{ formatRuneValue(tokenItem.runeDepth) }}
                    </span>
                  </span>
                </div>
              </div>
              <p class="symbol">{{ tokenItem.symbol || 'Unknown Symbol' }}</p>
              <address-bar :address-str="tokenItem.address" />
            </div>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchIcon from '~/assets/images/search.svg?inline'

export default {
  name: 'TokenWhitelist',
  components: {
    SearchIcon,
  },
  data() {
    return {
      tokenCollection: null,
      isLoading: true,
      currentChain: 'ALL',
      showInformation: false,
      searchTerm: '',
    }
  },
  computed: {
    filteredTokenItems() {
      if (!this.tokenCollection?.tokens) return []

      const query = this.searchTerm.trim().toLowerCase()
      const chainFilter = this.currentChain

      return this.tokenCollection.tokens.filter((token) => {
        if (!query && chainFilter === 'ALL') return true

        const name = token.name?.toLowerCase() || ''
        const symbol = token.symbol?.toLowerCase() || ''
        const address = token.address?.toLowerCase() || ''
        const chain = token.chain?.toLowerCase() || ''
        const status = token.poolStatus?.toLowerCase() || ''

        const matchesSearch =
          !query ||
          name.includes(query) ||
          symbol.includes(query) ||
          address.includes(query) ||
          chain.includes(query) ||
          status.includes(query)

        const matchesChain =
          chainFilter === 'ALL' || token.chain === chainFilter

        return matchesSearch && matchesChain
      })
    },
  },
  mounted() {
    this.fetchTokenData()
  },
  methods: {
    getAssetString(tokenItem) {
      if (tokenItem.chain && tokenItem.symbol && tokenItem.address) {
        const cleanSymbol = tokenItem.symbol.split(' ')[0]
        return `${tokenItem.chain}.${cleanSymbol}-${tokenItem.address}`
      }
      return 'RUNE'
    },
    async fetchTokenData() {
      try {
        const [ethResponse, configResponse, poolsResponse] = await Promise.all([
          this.$api.getEthTokenList(),
          this.$api.getDefaultConfig(),
          this.$api.getThorPools(),
        ])

        const ethList = ethResponse.data
        const configText = configResponse.data
        const pools = poolsResponse.data

        const chainWhitelists = {}
        const lines = configText.split('\n')
        let currentChain = ''
        let inBlockScanner = false

        for (const line of lines) {
          const chainMatch = line.match(/^\s+(\w+):$/)
          if (
            chainMatch &&
            ['base', 'avax', 'bsc'].includes(chainMatch[1].toLowerCase())
          ) {
            currentChain = chainMatch[1].toUpperCase()
            inBlockScanner = false
            continue
          }

          if (line.includes('block_scanner:')) {
            inBlockScanner = true
            continue
          }

          if (inBlockScanner && line.includes('whitelist_tokens:')) {
            chainWhitelists[currentChain] = []
            continue
          }

          const tokenMatch = line.match(/^\s+-\s+(0x[a-fA-F0-9]+)\s+#\s*(.+)?$/)
          if (tokenMatch && currentChain) {
            const [_, address, comment] = tokenMatch
            chainWhitelists[currentChain] = chainWhitelists[currentChain] || []
            chainWhitelists[currentChain].push({
              address: address.toLowerCase(),
              symbol: comment?.trim() || 'UNKNOWN',
            })
          }
        }

        const ethTokens = ethList.tokens.map((t) => ({
          ...t,
          chain: 'ETH',
          name: t.name || `ETH Token (${t.symbol})`,
          symbol: t.symbol,
        }))

        const otherChainTokens = Object.entries(chainWhitelists).flatMap(
          ([chain, tokens]) =>
            tokens.map((token) => {
              const commentParts = token.symbol.split(' ')
              const symbol = commentParts[0]
              const name =
                commentParts.length > 1
                  ? commentParts.slice(1).join(' ')
                  : symbol

              return {
                address: token.address,
                symbol: symbol,
                name: name,
                chainId: chain === 'BSC' ? 56 : chain === 'AVAX' ? 43114 : 8453,
                chain: chain,
              }
            })
        )

        const allTokens = [...otherChainTokens, ...ethTokens]

        const enrichedTokens = allTokens.map((token) => {
          const poolAsset = `${token.chain}.${token.symbol}-${token.address.toUpperCase()}`
          const pool = pools.find((p) => p.asset === poolAsset)

          return {
            ...token,
            poolStatus: pool?.status,
            runeDepth: pool ? Number(pool.balance_rune) / 1e8 : undefined,
          }
        })

        this.tokenCollection = {
          name: 'THORChain Token Whitelist',
          timestamp: new Date().toISOString(),
          version: { major: 1, minor: 0, patch: 0 },
          keywords: ['thorchain', 'ethereum', 'bsc', 'avalanche', 'base'],
          tokens: enrichedTokens,
        }

        this.isLoading = false
      } catch (err) {
        console.error('Error fetching token lists:', err)
        this.isLoading = false
      }
    },
    badgeColorClass(chain) {
      switch (chain) {
        case 'ETH':
          return 'info'
        case 'BSC':
          return 'yellow'
        case 'AVAX':
          return 'danger'
        default:
          return ''
      }
    },
    formatRuneValue(amount) {
      if (!amount) return ''
      if (amount < 10000) return '<10k'
      if (amount < 1000000) return `${Math.round(amount / 1000)}k`
      return `${(amount / 1000000).toFixed(1)}M`
    },
    setChainFilter(chain) {
      this.currentChain = chain
    },
    toggleInfo() {
      this.showInformation = !this.showInformation
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: $space-16;
}

.title-section {
  display: flex;
  gap: $space-8;
  margin: 0 10px;
  position: relative;
}

.title-with-info-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.title-with-info {
  display: flex;
  align-items: center;
  gap: $space-12;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: $radius-2lg;
  padding: $space-2;
}

.info-button {
  background: transparent;
  border: none;
  color: var(--sec-font-color);
  border-radius: 50%;
  cursor: pointer;
  padding: $space-4;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
}

.info-section {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: $space-8;
  z-index: 10;
  width: 100%;
  min-width: 300px;
  max-width: 400px;
  padding: $space-20;
  line-height: 1.5;
  font-size: 0.95rem;
  color: var(--sec-font-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-btns {
  display: flex;
  flex-wrap: wrap;
  gap: $space-5;
  margin-left: $space-5;

  .filter-button {
    background-color: var(--bg-color);
    color: var(--sec-font-color);
    border: 1px solid var(--border-color);
    border-radius: $radius-2lg;
    padding: $space-8 $space-10;
    font-size: $font-size-sm;
    cursor: pointer;
    @include lg {
      padding: $space-8 $space-16;
    }
    &:hover {
      color: var(--primary-color);
    }

    &.active {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
  }
}

.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: $space-8;
  margin: $space-0 $space-10;

  @include lg {
    margin: $space-0;
    gap: $space-0;
  }
}

#nodes-search-container {
  display: flex;
  position: relative;
  flex: 1;

  .search-input {
    flex: 1;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color) !important;
    border-radius: $radius-lg;
    color: var(--sec-font-color);
    outline: none;
    padding: $space-12;
    font-size: $font-size-mobile;
    font-weight: 450;
    width: 22rem;
    margin: $space-2;

    @include lg {
      width: 28rem;
    }

    &:focus {
      border-color: transparent;
      box-shadow: 0 0 0 0.15rem rgba(255, 255, 255, 0.1);
      color: var(--primary-color);
    }
  }

  .search-icon {
    position: absolute;
    width: 20px;
    height: 24px;
    fill: var(--font-color);
    right: 0.8rem;
    top: calc(50% - 0.8rem);
    cursor: pointer;
    background: var(--card-bg-color);
    padding-left: $space-8;
  }
}
.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-bottom: 2rem;

  .token-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $space-8;
  }

  .token-info {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    flex: 1;

    .name-token {
      display: flex;
      align-items: center;
    }

    h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--sec-font-color);
    }

    .symbol {
      color: var(--border-color);
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }
  }

  .badge-container {
    display: flex;
    gap: $space-8;
    align-items: center;
  }

  .pool-badge {
    display: flex;
    align-items: center;
    padding: 3px 5px;
    font-weight: bold;
    font-size: $space-8;
    border: 1px solid var(--border-color);
    border-radius: $radius-s;
    color: var(--sec-font-color);

    .rune-depth {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-left: 5px;
    }
  }
}
</style>
