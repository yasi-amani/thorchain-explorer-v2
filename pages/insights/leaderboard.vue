<template>
  <div class="leaderboard-container">
    <div class="data-section">
      <h3 class="section-title">Affiliate Collected</h3>
      <div
        v-for="(row, index) in sortedData(affiliateData, 'affiliate_fees_usd')"
        :key="index"
        class="data-item"
      >
        <div class="item-content">
          <span class="item-number" :style="{ color: colorizeIndex(index) }">
            {{ index + 1 }}.
          </span>
          <div class="item-details">
            <img
              v-if="affiliateWallet(row.affiliate).icon"
              :src="affiliateWallet(row.affiliate).icon"
              class="item-icon"
            />
            <div v-else class="affiliate-name">{{ row.affiliate }}</div>
            <div
              class="affiliate-value"
              :style="{ color: colorizeIndex(index) }"
            >
              ${{ row.affiliate_fees_usd | number('0a') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-section">
      <h3 class="section-title">Swap Volume</h3>
      <div
        v-for="(row, index) in sortedData(swapVolume, 'total_volume_usd')"
        :key="index"
        class="data-item"
      >
        <div class="item-content">
          <span class="item-number" :style="{ color: colorizeIndex(index) }">
            {{ index + 1 }}.
          </span>
          <div class="item-details">
            <img
              v-if="affiliateWallet(row.affiliate).icon"
              :src="affiliateWallet(row.affiliate).icon"
              class="item-icon"
            />
            <div v-else class="affiliate-name">{{ row.affiliate }}</div>
            <div
              class="affiliate-value"
              :style="{ color: colorizeIndex(index) }"
            >
              ${{ row.total_volume_usd | number('0a') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-section">
      <h3 class="section-title">Swap Count</h3>
      <div
        v-for="(row, index) in sortedData(affiliateData, 'total_swaps')"
        :key="index"
        class="data-item"
      >
        <div class="item-content">
          <span class="item-number" :style="{ color: colorizeIndex(index) }">
            {{ index + 1 }}.
          </span>
          <div class="item-details">
            <img
              v-if="affiliateWallet(row.affiliate).icon"
              :src="affiliateWallet(row.affiliate).icon"
              class="item-icon"
            />
            <div v-else class="affiliate-name">{{ row.affiliate }}</div>
            <div
              class="affiliate-value"
              :style="{ color: colorizeIndex(index) }"
            >
              {{ row.total_swaps | number('0,0') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-stat">
      <strong>
        <sup>*</sup>
        All of the stat are based on 30 days period for now
      </strong>
    </div>
  </div>
</template>

<script>
import { orderBy } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      swapVolume: [],
      affiliateData: [],
      sortDirection: {
        affiliate_fees_usd: 'desc',
        total_volume_usd: 'desc',
        total_swaps: 'desc',
      },
    }
  },
  computed: {
    ...mapGetters({
      theme: 'getTheme',
    }),
  },
  mounted() {
    try {
      this.$api.getAffiliateByWallet().then(({ data }) => {
        this.formatData(data)
      })

      this.$api.getAffiliateSwapsByWallet().then(({ data }) => {
        this.formatVolume(data)
      })
    } catch (error) {
      console.error('Error fetching affiliate data:', error)
    }
  },
  methods: {
    mapMissing(item) {
      switch (item.affiliate) {
        case 'Edge Wallet':
          return 'edge'
        case 'OneKey Wallet':
          return 'oneKey'
        case 'ELD':
          return 'Eldorito'
        case 'dcf':
          return 'Decentralfi'
        default:
          return item.affiliate
      }
    },
    formatData(data) {
      this.affiliateData = data.map((item) => {
        return {
          affiliate: this.mapMissing(item),
          affiliate_fees_usd: item.affiliate_fees_usd,
          total_swaps: item.total_swaps,
        }
      })
    },
    formatVolume(data) {
      this.swapVolume = data
        .filter((it) => it.affiliate !== 'No Affiliate')
        .map((item) => {
          return {
            affiliate: this.mapMissing(item),
            total_volume_usd: item.total_volume_usd,
          }
        })
    },
    sortedData(data, field) {
      return orderBy(data, [field], [this.sortDirection[field]])
    },
    colorizeIndex(index) {
      switch (index) {
        case 0:
          return '#FFD700'

        case 1:
          return '#CD7F32'

        case 2:
          return '#C0C0C0'
        default:
          return 'var(--font-color)'
      }
    },

    affiliateWallet(affiliateName) {
      const detail = this.mapInterfaceName(affiliateName)
      return detail
        ? {
            icon:
              this.theme === 'dark' ? detail.icons.urlDark : detail.icons.url,
            name: detail.name,
          }
        : {
            icon: undefined,
            name: affiliateName,
          }
    },
  },
}
</script>

<style lang="scss" scoped>
.leaderboard-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;

  .data-section {
    flex: 1;
    min-width: 400px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);

    @include md {
      border-radius: 0.5rem;
    }

    .section-title {
      text-align: center;
      color: var(--sec-font-color);
      padding-bottom: 1.1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .data-item {
      background-color: var(--bg-color);
      border-bottom: 1px solid var(--border-color);
      padding: 10px;
      margin: 10px;
      margin-bottom: 10px;

      &:last-child {
        border-bottom: none;
      }

      .item-content {
        display: flex;
        align-items: center;

        .item-number {
          font-weight: bold;
          margin-right: 13px;
        }

        .affiliate-name {
          color: var(--sec-font-color);
        }

        .item-icon {
          height: 1.7rem;
          padding: 4px 0;
          margin-right: 15px;
          display: flex;
          align-items: center;
        }

        .item-details {
          display: flex;
          justify-content: space-between;
          flex: 1;

          .affiliate-value {
            font-size: 1.05rem;
            color: var(--sec-font-color);
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>
