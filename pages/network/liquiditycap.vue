<template>
  <div>
    <StatsPanel :metrics="vaultMetrics" />

    <div class="secondary-info">
      <span>Total Node Bond: {{ formatNumber(totalNodeBond) }} </span>
      <span class="separator">|</span>
      <span>Total Pooled RUNE: {{ formatNumber(totalPooledRune) }} </span>
      <span class="separator">|</span>
      <span
        >TVLCAP:
        {{
          tvlCapBasisPoints === -1
            ? 'Legacy'
            : (tvlCapBasisPoints / 10000).toFixed(2)
        }}</span
      >
    </div>

    <card>
      <TableLoader v-if="loading" :cols="cols" />
      <vue-good-table
        v-else
        :columns="cols"
        :rows="vaultAssets"
        style-class="vgt-table net-table"
      >
        <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field === 'asset'" class="cell-content">
            <AssetIcon :asset="props.row.asset" chain="THOR.RUNE" />
            <span class="ellipsis">
              {{ props.formattedRow[props.column.field] }}</span
            >
          </span>
        </template>
      </vue-good-table>
    </card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      vaultAssets: [],
      totalVaultValueInRune: null,
      totalSecurityBudget: null,
      totalNodeBond: null,
      totalPooledRune: null,
      securityDelta: null,
      tvlCapBasisPoints: -1,
      effectiveSecurityBudget: null,
      cols: [
        {
          label: 'Asset',
          field: 'asset',
          formatFn: this.formatAsset,
        },
        {
          label: 'Amount',
          field: 'amount',
          type: 'number',
          formatFn: (value) => this.formatNumber(value, 4),
        },
        {
          label: 'RUNE Value',
          field: 'runeValue',
          type: 'number',
          formatFn: (value) => this.formatNumber(value),
        },
      ],
    }
  },
  computed: {
    vaultMetrics() {
      return [
        {
          label: 'Total Vault Value',
          value: this.formatNumber(this.totalVaultValueInRune) + ' RUNE',
        },
        {
          label: 'Security Budget',
          value: this.formatNumber(this.totalSecurityBudget) + ' RUNE',
        },
        {
          label: 'Security Delta',
          progress: {
            data: this.securityDelta,
            down: this.securityDelta < 0,
            filter: (val) => this.formatNumber(val) + ' RUNE',
          },
          subValue:
            this.securityDelta < 0
              ? 'Over Security Budget'
              : 'Under Security Budget',
        },
      ]
    },
  },
  mounted() {
    this.fetchVaultData()
  },
  methods: {
    formatNumber(number, decimals = 2) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number)
    },
    async fetchVaultData() {
      try {
        const vaults = (await this.$api.getAsgard()).data
        const pools = (await this.$api.getThorPools()).data
        const tvlCapResponse = await this.$api.getMimir('TVLCAPBASISPOINTS')
        this.tvlCapBasisPoints = tvlCapResponse.data.TVLCAPBASISPOINTS

        const assetPrices = {}
        pools.forEach((pool) => {
          assetPrices[pool.asset] =
            Number(pool.balance_rune) / Number(pool.balance_asset)
        })

        this.totalPooledRune = pools.reduce(
          (sum, pool) => sum + Number(pool.balance_rune) / 1e8,
          0
        )

        const assets = new Map()
        vaults.forEach((vault) => {
          vault.coins.forEach((coin) => {
            const currentAmount = assets.get(coin.asset)?.amount || 0
            assets.set(coin.asset, {
              amount: currentAmount + Number(coin.amount),
              asset: coin.asset,
            })
          })
        })

        this.vaultAssets = Array.from(assets.values()).map((asset) => {
          const amountInBase = asset.amount / 1e8
          const runePrice = assetPrices[asset.asset] || 0
          const runeValue = amountInBase * runePrice

          return {
            asset: asset.asset,
            amount: amountInBase,
            runeValue: runeValue,
          }
        })

        this.totalVaultValueInRune = this.vaultAssets.reduce(
          (sum, asset) => sum + asset.runeValue,
          0
        )

        const nodes = (await this.$api.getNodes()).data
        const activeNodes = nodes
          .filter((node) => node.status === 'Active')
          .sort((a, b) => Number(b.total_bond) - Number(a.total_bond))

        this.totalNodeBond =
          activeNodes.reduce((sum, node) => sum + Number(node.total_bond), 0) /
          1e8

        const cutoffIndex = Math.floor(activeNodes.length / 3)
        const bottomTwoThirdsNodes = activeNodes.slice(cutoffIndex)

        this.effectiveSecurityBudget =
          bottomTwoThirdsNodes.reduce(
            (sum, node) => sum + Number(node.total_bond),
            0
          ) / 1e8

        this.totalSecurityBudget =
          this.tvlCapBasisPoints === -1
            ? this.effectiveSecurityBudget
            : (this.tvlCapBasisPoints / 10000) * this.totalNodeBond

        this.securityDelta =
          this.totalSecurityBudget - this.totalVaultValueInRune
      } catch (e) {
        console.error('Error fetching data:', e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.secondary-info {
  font-size: $font-size-xs;
  color: var(--sec-font-color);
  margin: $space-16;
  padding: $space-8;
  background: var(--surface-color-light);
  border-radius: $space-4;
  display: flex;
  justify-content: center;
  gap: $space-16;
  align-items: center;
  @include lg {
    font-size: $font-size-sm;
    justify-content: flex-end;
  }
}
</style>
