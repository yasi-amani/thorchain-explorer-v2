<template>
  <page>
    <div class="grid-network">
      <div class="chart-inner-container">
        <Card :is-loading="!rewardsHistory" title="Reserve income from Pools">
          <VChart
            :option="rewardsHistory"
            :loading="!rewardsHistory"
            :loading-options="showLoading"
            :theme="chartTheme"
            :autoresize="true"
          />
        </Card>
      </div>
      <div class="grid-network">
        <Card :is-loading="!reserveHistory" title="Reserve Breakdown">
          <VChart
            :option="reserveHistory"
            :loading="!reserveHistory"
            :loading-options="showLoading"
            :theme="chartTheme"
            :autoresize="true"
          />
        </Card>
      </div>
    </div>
  </page>
</template>
<script>
import moment from 'moment'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { orderBy } from 'lodash'

use([
  SVGRenderer,
  GridComponent,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

export default {
  components: {
    VChart,
  },
  data() {
    return {
      loading: true,
      rewardsHistory: undefined,
      reserveHistory: undefined,
    }
  },
  mounted() {
    this.$api.getEarningHistory(60).then(({ data }) => {
      this.rewardsHistory = this.formatRewards(data)
    })
    this.$api.getReserveHistory().then(({ data }) => {
      this.reserveHistory = this.formatReserve(data)
    })
  },
  methods: {
    formatRewards(d) {
      const top = 6
      const poolEarnings = orderBy(
        d.intervals[d.intervals.length - 2].pools,
        [(o) => Math.abs(+o.rewards)],
        ['desc']
      )
        .filter((p) => p.pool !== 'dev_fund_reward' && p.pool !== 'income_burn')
        .slice(0, top)
        .map((p) => p.pool)

      const xAxis = []
      const pr = []
      const pt = []

      d?.intervals.forEach((interval, index) => {
        if (index === d?.intervals?.length - 1) {
          return
        }

        // Date
        const date = moment(
          Math.floor((~~interval.endTime + ~~interval.startTime) / 2) * 1e3
        )
        xAxis.push(date.format('dddd, MMM D'))

        let otherEarnings = interval.pools.filter(
          (p) =>
            !poolEarnings.slice(0, top).includes(p.pool) &&
            p.pool !== 'income_burn' &&
            p.pool !== 'dev_fund_reward'
        )

        // sum them all
        otherEarnings = otherEarnings.reduce(
          (a, c) => a + (-1 * +c.rewards * +interval.runePriceUSD) / 1e8,
          0
        )

        if (index === 0) {
          pr.push({
            type: 'bar',
            name: 'Other Pools',
            showSymbol: false,
            stack: 'Total',
            data: [otherEarnings],
          })
        } else {
          pr[0].data.push(otherEarnings)
        }

        // Pool Earning
        let total = 0
        for (let pi = 0; pi < top; pi++) {
          const pool = interval.pools.find((p) => p.pool === poolEarnings[pi])
          const value = (+pool.rewards * -1 * +interval.runePriceUSD) / 1e8
          total += value

          const earning = {
            value,
          }

          if (index === 0) {
            pr.push({
              type: 'bar',
              name: this.showAsset(poolEarnings[pi]),
              showSymbol: false,
              stack: 'Total',
              data: [earning],
            })
          } else {
            pr[pi + 1].data.push(earning)
          }
        }

        pt.push({
          value: total,
        })
      })

      return this.basicChartFormat(
        (value) => `$${this.normalFormat(value, '0,0.00a')}`,
        [
          ...pr,
          {
            type: 'line',
            name: 'Total Income',
            showSymbol: false,
            areaStyle: {
              color: 'rgba(0, 0, 47, 0.2)',
            },
            data: pt,
            smooth: true,
            lineStyle: {
              width: 2,
            },
            z: 3,
          },
        ],
        xAxis,
        {
          legend: {
            show: false,
          },
          yAxis: [
            {
              type: 'value',
              name: '',
              position: 'right',
              show: false,
              splitLine: {
                show: true,
              },
            },
          ],
        },
        (param) => {
          return `
            <div class="tooltip-header">
              ${param[0].name}
            </div>
            <div class="tooltip-body">
              ${param
                .filter((a) => a.value)
                .sort((a, b) => {
                  if (
                    a.seriesName === 'Total Income' ||
                    a.seriesName === 'Other Pools'
                  )
                    return 1
                  if (
                    b.seriesName === 'Total Income' ||
                    b.seriesName === 'Other Pools'
                  )
                    return -1
                  return b.value - a.value
                })
                .map(
                  (p, i) => `
                  ${
                    param.length - 2 === i
                      ? ` <span style="border-top: 1px solid var(--border-color); margin: 2px 0;"></span>`
                      : ''
                  }
                  <span>
                    <div class="tooltip-item">
                      <div class="data-color" style="background-color: ${p.color}">
                      </div>
                      <span style="text-align: left;">
                        ${p.seriesName}
                      </span>
                    </div>
                    <b>$${p.value ? this.$options.filters.number(p.value, '0,0.00a') : '-'}</b>
                  </span>`
                )
                .join('')}
            </div>
          `
        }
      )
    },
    formatReserve(d) {
      const xAxis = []
      const pf = []
      const pr = []
      const pn = []
      const pt = []
      d?.intervals.forEach((interval, index) => {
        // ignore the last index
        if (index === d?.intervals?.length - 1) {
          return
        }
        xAxis.push(
          moment(
            Math.floor((~~interval.endTime + ~~interval.startTime) / 2) * 1e3
          ).format('dddd, MMM D')
        )
        pf.push(+interval.gasFeeOutbound / 10 ** 8)
        pr.push((+interval.gasReimbursement * -1) / 10 ** 8)
        pn.push(+interval.networkFee / 10 ** 8)

        pt.push(
          (+interval.gasFeeOutbound +
            +interval.networkFee -
            +interval.gasReimbursement) /
            1e8
        )
      })
      return this.basicChartFormat(
        (value) => `${this.normalFormat(value)} RUNE`,
        [
          {
            type: 'bar',
            name: 'Fee outbound',
            stack: 'total',
            showSymbol: false,
            data: pf,
          },
          {
            type: 'bar',
            name: 'Network Fee',
            stack: 'total',
            showSymbol: false,
            data: pn,
          },
          {
            type: 'bar',
            name: 'Gas Reimbursement',
            stack: 'total',
            showSymbol: false,
            data: pr,
          },
          {
            type: 'line',
            name: 'Total Income',
            showSymbol: false,
            areaStyle: {
              color: 'rgba(243, 186, 47, 0.2)',
            },
            data: pt,
            smooth: true,
            lineStyle: {
              width: 2,
            },
            z: 3,
          },
        ],
        xAxis,
        {
          yAxis: [
            {
              type: 'value',
              position: 'left',
              show: false,
              splitLine: {
                show: true,
              },
              axisLine: {
                show: false,
              },
              min: 'dataMin',
              max: 'dataMax',
            },
          ],
        }
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.grid-network {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 0.5rem;
  gap: 0.5rem;
}
</style>
