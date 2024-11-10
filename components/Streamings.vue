<template>
  <Card
    :is-loading="loading"
    body-class="streaming-flex"
    :navs="[
      { title: 'Ongoing Streaming Swaps', value: 'streamingSwaps' },
      { title: 'Latest Transactions', value: 'recentTransactions' },
    ]"
    :act-nav.sync="Mode"
  >
    <template #header>
      <dot-live />
    </template>
    <template v-if="Mode == 'streamingSwaps'">
      <div v-if="streamingSwaps.length > 0" class="custom-card">
        <div class="overview-box">
          <div class="stats-container">
            <div>
              <span class="item-value"> Amount: </span>
              <span
                v-if="totalSumAmount"
                class="total-swaps mono"
                style="padding-right: 1rem"
              >
                ${{ totalSumAmount | number('0a') }}
              </span>
              <span v-else>-</span>
            </div>
            <div>
              <span class="item-value"> Count: </span>
              <span class="total-swaps mono">{{ streamingSwaps.length }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard-card">
        <div v-if="noStreaming" class="no-streaming">
          <streamingIcon class="streaming-icon large-icon" />
          <h3>There is no streaming swaps ongoing at the moment.</h3>
        </div>
        <template v-for="(o, i) in filteredStreamingSwaps" v-else>
          <div :key="i" class="streaming-item">
            <div class="upper-body">
              <div class="asset-container">
                <div v-if="o.inputAsset" class="asset-item">
                  <asset-icon :asset="o.inputAsset.asset" />
                  <span class="asset-name">
                    {{
                      $options.filters.number(
                        o.inputAsset.amount / 1e8,
                        '0,0.0000'
                      )
                    }}
                    <small class="asset-text sec-color">{{
                      o.inputAsset.asset
                    }}</small>
                  </span>
                </div>
                →
                <div v-if="o.outputAsset" class="asset-item">
                  <asset-icon :asset="o.outputAsset.asset" />
                  <span class="asset-name">
                    <template v-if="o.outputAsset.amount">{{
                      $options.filters.number(
                        o.outputAsset.amount / 1e8,
                        '0,0.0000'
                      )
                    }}</template>
                    <small class="asset-text sec-color">
                      {{ showAsset(o.outputAsset.asset) }}
                    </small>
                  </span>
                </div>
              </div>
              <small
                v-if="o.tx_id"
                class="sec-color mono"
                style="margin-left: auto"
              >
                <NuxtLink
                  v-if="isValidTx(o.tx_id)"
                  class="clickable"
                  :to="{ path: `/tx/${o.tx_id}` }"
                >
                  {{ formatAddress(o.tx_id) }}
                </NuxtLink>
              </small>
            </div>

            <div class="extra-info">
              <progress-bar
                v-if="o.quantity > 0"
                :width="(o.count / o.quantity) * 100"
                height="4px"
              />
              <small style="white-space: nowrap">
                {{ $options.filters.percent(o.count / o.quantity) }}
              </small>
            </div>

            <small style="margin-top: 5px"
              >{{ o.interval }} Blocks / Swap
              <span class="sec-color"
                ><small style="color: var(--font-color)">(ETA </small>
                {{ o.remaningETA }}
                <small style="color: var(--font-color)"
                  >, Remaining swaps: {{ o.quantity - o.count }}</small
                >
                <small style="color: var(--font-color)">)</small>
              </span>
            </small>
          </div>
          <hr :key="i + '-hr'" class="hr-space" />
        </template>
      </div>
      <nuxt-link to="/swaps" class="swaps-nav">TOP Swaps (24hr)</nuxt-link>
    </template>
    <template v-if="Mode == 'recentTransactions'">
      <div class="card-body">
        <template v-if="txs">
          <template v-for="(t, i) in txs">
            <div :key="i" class="row-item-transactions">
              <div class="transactions">
                <span
                  v-if="t.in"
                  style="font-size: 0.875rem; color: var(--sec-font-color)"
                >
                  <small style="color: var(--font-color)">TxID</small>
                  <nuxt-link class="clickable" :to="`/tx/${t.in[0].txID}`">
                    {{ formatAddress(showTx(t.in && t.in[0].txID)) }}
                  </nuxt-link>
                </span>
                <transaction-action :row="t" :show-mini-bubble="false" />
              </div>
              <div class="txs">
                <span>
                  <small style="color: var(--font-color)">From</small>
                  <nuxt-link
                    class="clickable"
                    :to="`/address/${t.in[0].address}`"
                  >
                    {{ formatAddress(t.in && t.in[0].address) }}
                  </nuxt-link>
                </span>
                <nuxt-link class="clickable header" :to="`/block/${t.height}`">
                  {{ t.height | number('0,0') }}
                </nuxt-link>

                <span class="timestamp">
                  {{ formatMoment(t.date) }}
                </span>
              </div>
            </div>
            <hr :key="i + 'hr'" class="hr-space" />
          </template>
        </template>
        <div v-else class="loading">
          <BounceLoader color="var(--font-color)" size="3rem" />
        </div>
      </div>
      <nuxt-link to="/txs" class="swaps-nav">
        <span>More</span>
        <ArrowRightIcon class="more-link" />
      </nuxt-link>
    </template>
    <template #footer>
      <b-pagination
        v-if="streamingSwaps.length > perPage"
        v-model="currentPage"
        class="center"
        :total-rows="streamingSwaps.length"
        :per-page="perPage"
      />
    </template>
  </Card>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import TransactionAction from './transactions/TransactionAction.vue'
import { shortAssetName } from '~/utils'
import streamingIcon from '@/assets/images/streaming.svg?inline'
import ArrowRightIcon from '~/assets/images/arrow-right.svg?inline'

export default {
  components: { streamingIcon, TransactionAction, ArrowRightIcon },
  data() {
    return {
      currentPage: 1,
      noStreaming: false,
      loading: true,
      streamingSwaps: [],
      intervalId: undefined,
      perPage: 7,
      Mode: 'streamingSwaps',
      totalSumAmount: 0,
    }
  },
  computed: {
    filteredStreamingSwaps() {
      return this.streamingSwaps.slice(
        (this.currentPage - 1) * this.perPage,
        this.currentPage * this.perPage
      )
    },
    ...mapGetters({
      pools: 'getPools',
    }),
  },
  watch: {
    pools(n, o) {
      this.updateStreamingSwap()
    },
  },
  mounted() {
    this.$api.getDashboardData().then(({ data }) => {
      this.txs = data?.txs?.actions
    })

    this.intervalId = setInterval(() => {
      this.updateStreamingSwap()
    }, 10000)
  },
  destroyed() {
    clearInterval(this.intervalId)
  },
  methods: {
    async updateStreamingSwap() {
      this.noStreaming = false
      const resData = (await this.$api.getStreamingSwaps()).data
      this.totalSumAmount = resData?.reduce((a, c) => {
        const inputUsdValue = this.amountToUSD(
          c.source_asset,
          c.deposit,
          this.pools
        )
        return a + inputUsdValue
      }, 0)

      if (!resData || resData.length === 0) {
        this.noStreaming = true
        this.streamingSwaps = []
        this.loading = false
        return
      }
      try {
        const swaps = []

        for (let i = 0; i < resData.length; i++) {
          const swap = { ...resData[i] } // Clone swap data
          const swapDetails = (await this.$api.getTxStatus(resData[i].tx_id))
            .data // Fetch swap details

          const txAsset = swapDetails?.tx
          if (txAsset && txAsset.coins.length > 0) {
            swap.inputAsset = {
              asset: txAsset.coins[0].asset,
              amount: txAsset.coins[0].amount,
            }
          }

          let nonRUNE = false
          if (!swap.outputAsset?.asset) {
            const memo = swapDetails.tx?.memo
            if (memo) {
              const m = swapDetails.tx?.memo.split(':', 3)[1]
              const outAsset = shortAssetName(m)
              if (outAsset !== 'THOR.RUNE') {
                nonRUNE = true
              }
              swap.outputAsset = {
                asset: outAsset,
              }
            }
          }

          const outAsset = swapDetails?.out_txs
          if (outAsset && outAsset.length > 0) {
            const oa = outAsset.map((o) => ({
              asset: o.coins[0]?.asset,
              amount: o.coins[0].amount,
            }))
            const tmpOut = {
              amount: 0,
              asset: '',
              new: false,
            }
            if (oa.every((a) => a.asset === 'THOR.RUNE') && !nonRUNE) {
              tmpOut.amount = oa?.reduce((a, b) => Math.max(+a, +b), -Infinity)
              tmpOut.asset = oa[0].asset
              tmpOut.new = true
            } else {
              const nonRuneAsset = oa.find((a) => a.asset !== 'THOR.RUNE')
              if (nonRuneAsset) {
                tmpOut.amount = nonRuneAsset.amount
                tmpOut.asset = nonRuneAsset.asset
                tmpOut.new = true
              }
              if (tmpOut.new) {
                swap.outputAsset = {
                  asset: tmpOut.asset,
                  amount: tmpOut.amount,
                }
              }
            }
          }

          const plannedAsset = swapDetails?.planned_out_txs
          if (plannedAsset && plannedAsset.length > 0) {
            if (nonRUNE && plannedAsset[0].coin.asset !== 'THOR.RUNE') {
              swap.outputAsset = {
                asset: plannedAsset[0].coin?.asset,
                amount: plannedAsset[0].coin?.amount,
              }
            }
          }

          swap.remaingIntervals =
            resData[i].interval * (resData[i].quantity - resData[i].count)
          swap.remaningETA = moment
            .duration(swap.remaingIntervals * 6, 'seconds')
            .humanize()

          if (swap.outputAsset?.asset && this.pools) {
            swap.outputAsset.asset = this.findAssetInPool(
              swap.outputAsset?.asset,
              this.pools
            )
          }
          swaps.push(swap)
        }
        this.streamingSwaps = swaps
        this.loading = false
      } catch (error) {
        console.error(error)
        this.noStreaming = true
        this.loading = false
      }
    },
    showTx(txID) {
      if (
        txID ===
        '0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        return 'Internal Tx'
      }
      return txID
    },
    formatMoment(time) {
      return moment(Number.parseInt(time / 10 ** 6)).fromNow()
    },
  },
}
</script>

<style lang="scss" scoped>
.more-link {
  margin-left: 4px;
  vertical-align: middle;
  fill: currentColor;
  height: 1rem;
  width: 1rem;
}
.dashboard-card {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.swaps-nav {
  margin-top: 1rem !important;
  display: flex;
  align-items: center !important;
}

.overview-box {
  width: 100%;
  text-align: center;
}

.title {
  font-weight: 600;
  color: var(--font-color);
  animation: fadeIn 0.5s ease;
}

.stats-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  @include md {
    flex-direction: row;
    justify-content: space-between;

    div {
      display: flex;
      justify-content: center;
      gap: 1rem;

      &:first-child {
        flex: 2;
        border-bottom: none !important;
        border-right: 1px solid var(--primary-color);
      }
    }
  }

  div {
    flex: 1;
    padding: 0.4rem;
    margin: 0;
    animation: slideIn 0.5s ease;

    @include md {
      padding: 0;
    }

    &:first-child {
      border-bottom: 1px solid var(--primary-color);
    }
  }
}

.total-swaps {
  color: var(--sec-font-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.no-streaming {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;

  .streaming-icon {
    fill: var(--font-color);
  }

  h3 {
    text-align: center;
  }
}

.streaming-item {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;

  .asset-container {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .asset-item {
    display: flex;
    align-items: center;
    gap: 5px;

    .asset-text {
      display: inline-block;
      max-width: 100px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .asset-name {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }

  .upper-body {
    height: 38px;
    overflow: auto;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .extra-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.custom-card {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}
</style>
