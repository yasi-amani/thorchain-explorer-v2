<template>
  <div class="chart-section">
    <div class="timeframe-buttons">
      <button
        v-for="timeframe in timeframes"
        :key="timeframe.value"
        @click="changeTimeframe(timeframe.value)"
        :class="{ active: days === timeframe.value }"
      >
        {{ timeframe.label }}
      </button>
    </div>
    <Card
      :is-loading="loading"
      :title="`Daily Volume by Chain (${getTimeframeDisplay(days)})`"
    >
      <div class="chart-container">
        <VChart
          v-if="dailyVolume"
          class="chart"
          :option="dailyVolume"
          :autoresize="true"
          :theme="chartTheme"
        />
      </div>
    </Card>

    <Card
      :is-loading="loading"
      :title="`Daily Unique Swappers (${getTimeframeDisplay(days)})`"
    >
      <div class="chart-container">
        <VChart
          v-if="dailySwappers"
          class="chart"
          :option="dailySwappers"
          :autoresize="true"
          :theme="chartTheme"
        />
      </div>
    </Card>

    <Card
      :is-loading="loading"
      :title="`Daily DEX Volume Comparison (${getTimeframeDisplay(days)})`"
    >
      <div class="chart-container">
        <VChart
          v-if="dailyDexVolume"
          class="chart"
          :option="dailyDexVolume"
          :autoresize="true"
          :theme="chartTheme"
        />
      </div>
    </Card>

    <Card
      :is-loading="loading"
      :title="`THORChain DEX Dominance (${getTimeframeDisplay(days)})`"
    >
      <div class="chart-container">
        <VChart
          v-if="thorchainDominance"
          class="chart"
          :option="thorchainDominance"
          :autoresize="true"
          :theme="chartTheme"
        />
      </div>
    </Card>

    <Card
      :is-loading="loading"
      :title="`Module Balances (${getTimeframeDisplay(days)})`"
    >
      <div class="chart-container">
        <VChart
          v-if="moduleBalances"
          class="chart"
          :option="moduleBalances"
          :autoresize="true"
          :theme="chartTheme"
        />
      </div>
    </Card>

    <Card
      :is-loading="loading"
      :title="`THORChain Addresses (${getTimeframeDisplay(days)})`"
    >
      <div class="chart-container">
        <button @click="toggleAddressesView" class="button-address">
          {{ showDailyAddresses ? 'Total Addresses' : 'New Addresses' }}
        </button>
        <VChart
          v-if="thorchainAddresses"
          class="chart"
          :option="thorchainAddresses"
          :autoresize="true"
          :theme="chartTheme"
        />
      </div>
    </Card>
  </div>
</template>

<script>
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  SVGRenderer,
  GridComponent,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

export default {
  name: 'DailyVolumeChart',
  components: {
    VChart,
  },
  data() {
    return {
      loading: true,
      dailyVolume: null,
      dailySwappers: null,
      dailyDexVolume: null,
      moduleBalances: null,
      thorchainAddresses: null,
      showDailyAddresses: false,
      days: 30,
      timeframes: [
        { value: 7, label: '7 days' },
        { value: 30, label: '30 days' },
        { value: 90, label: '90 days' },
        { value: 180, label: '180 days' },
        { value: 365, label: '1 year' },
        { value: 99999, label: 'All Time' },
      ],
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        await Promise.all([
          this.fetchSwappersData(),
          this.fetchDailyVolume(),
          this.fetchDailyDexVolume(),
          this.fetchModuleBalances(),
          this.fetchThorchainAddresses(),
        ])
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchDailyVolume() {
      try {
        const { data } = await this.$api.getDailyVolume()
        this.volumeData = data.sort((a, b) => new Date(a.DAY) - new Date(b.DAY))
        this.updateDailyVolume()
      } catch (error) {
        console.error('Failed to fetch volume data:', error)
      }
    },

    async fetchSwappersData() {
      try {
        const { data } = await this.$api.getUniqueSwappers()
        this.swappersData = data.sort(
          (a, b) => new Date(a.DAY) - new Date(b.DAY)
        )
        this.updateDailySwappers()
      } catch (error) {
        console.error('Failed to fetch swapper data:', error)
      }
    },

    async fetchDailyDexVolume() {
      try {
        const { data } = await this.$api.getDailyDexVolume()
        this.dexVolumeData = data.sort(
          (a, b) => new Date(a.DAY) - new Date(b.DAY)
        )
        this.updateDailyDexVolume()
        this.updateThorchainDominance()
      } catch (error) {
        console.error('Failed to fetch DEX volume data:', error)
      }
    },

    async fetchModuleBalances() {
      try {
        const { data } = await this.$api.getModuleBalances()
        this.moduleBalancesData = data.sort(
          (a, b) => new Date(a.DAY) - new Date(b.DAY)
        )
        this.updateModuleBalances()
      } catch (error) {
        console.error('Failed to fetch module balance data:', error)
      }
    },

    async fetchThorchainAddresses() {
      try {
        const { data } = await this.$api.getThorchainAddresses()
        this.addressesData = data.sort(
          (a, b) => new Date(a.DAY) - new Date(b.DAY)
        )
        this.updateAddressesChart()
      } catch (error) {
        console.error('Failed to fetch addresses data:', error)
      }
    },
    updateDailyVolume() {
      const groupedByDate = {}
      const filteredData = this.getFilteredVolumeData()
      filteredData.forEach((d) => {
        if (!groupedByDate[d.DAY]) groupedByDate[d.DAY] = {}
        groupedByDate[d.DAY][d.BLOCKCHAIN] =
          (groupedByDate[d.DAY][d.BLOCKCHAIN] || 0) + d.VOLUME_USD
      })

      const dates = Object.keys(groupedByDate)
      const chains = [
        'THOR',
        'BTC',
        'ETH',
        'BSC',
        'AVAX',
        'GAIA',
        'LTC',
        'DOGE',
        'BCH',
      ]
      const datasets = chains.map((chain) => ({
        name: chain,
        type: 'bar',
        data: dates.map((date) => groupedByDate[date][chain] || 0),
        stack: 'total',
      }))

      this.dailyVolume = this.basicChartFormat(
        (value) => `$ ${this.$options.filters.number(+value, '0,0')}`,
        datasets,
        dates.map((d) => new Date(d).toLocaleDateString()),
        {
          xAxis: {
            show: true,
            type: 'category',
            data: dates,
            axisLabel: {
              formatter: (value) => new Date(value).toLocaleDateString(),
            },
          },
          yAxis: {
            show: true,
            type: 'value',
            axisLabel: {
              formatter: (value) =>
                `$${this.$options.filters.number(+value, '0,0a')}`,
            },
          },
          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line' },
            formatter: (params) => {
              const date = new Date(params[0].name).toLocaleDateString()
              const tooltipContent = params
                .map(
                  (param) =>
                    `${param.marker} ${param.seriesName}: $${this.$options.filters.number(
                      +param.value,
                      '0,0'
                    )}`
                )
                .join('<br/>')
              return `${date}<br/>${tooltipContent}`
            },
          },
        },
        undefined
      )
    },
    updateDailySwappers() {
      if (!this.swappersData) return
      const filteredData = this.getFilteredSwappersData()

      const labels = filteredData.map((d) =>
        new Date(d.DAY).toLocaleDateString()
      )
      const dailySwapperCount = filteredData.map(
        (d) => d.DAILY_UNIQUE_SWAPPER_COUNT
      )
      const swapper30DayAvg = filteredData.map(
        (d) => d.UNIQUE_SWAPPER_COUNT_30D_MA
      )

      this.dailySwappers = this.basicChartFormat(
        (value) => value.toLocaleString(),
        [
          {
            name: 'Daily Unique Swappers',
            type: 'bar',
            data: dailySwapperCount,
          },
          {
            name: '30-Day Average',
            type: 'line',
            data: swapper30DayAvg,
            lineStyle: { width: 2, type: 'dashed' },
            smooth: true,
            showSymbol: false,
          },
        ],
        labels,
        {
          yAxis: [
            {
              type: 'value',
              axisLabel: {
                formatter: (value) => value.toLocaleString(),
              },
            },
          ],
          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
          },
          legend: {
            data: ['Daily Unique Swappers', '30-Day Average'],
            selected: {
              '30-Day Average': false,
            },
          },
        },
        undefined
      )
    },
    updateDailyDexVolume() {
      if (!this.dexVolumeData) return
      const filteredData = this.getFilteredDexVolumeData()

      const groupedByDate = {}
      filteredData.forEach((d) => {
        if (!groupedByDate[d.DAY]) groupedByDate[d.DAY] = {}
        groupedByDate[d.DAY][d.PROTOCOL_NAME] = d.VOLUME_USD
      })

      const dates = Object.keys(groupedByDate)
      const dexPlatforms = [
        'THORChain',
        'Uniswap',
        'PancakeSwap',
        'Curve',
        'TraderJoe',
        'Dodo',
        'Orca',
        'Raydium',
        'Others',
      ]

      const datasets = dexPlatforms.map((dex) => ({
        name: dex,
        type: 'bar',
        data: dates.map((date) => groupedByDate[date][dex] || 0),
        stack: 'total',
      }))

      this.dailyDexVolume = this.basicChartFormat(
        (value) => `$${this.$options.filters.number(+value, '0,0')}`,
        datasets,
        dates.map((d) => new Date(d).toLocaleDateString()),
        {
          yAxis: [
            {
              type: 'value',
              axisLabel: {
                formatter: (value) => `$${(value / 1000000).toFixed(1)}M`,
              },
            },
          ],
          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
          },
        }
      )
    },
    updateThorchainDominance() {
      if (!this.dexVolumeData) return

      const filteredData = this.getFilteredDexVolumeData()

      const groupedByDate = {}
      filteredData.forEach((d) => {
        if (!groupedByDate[d.DAY]) {
          groupedByDate[d.DAY] = { total: 0, thor: 0 }
        }
        groupedByDate[d.DAY].total += d.VOLUME_USD
        if (d.PROTOCOL_NAME === 'THORChain') {
          groupedByDate[d.DAY].thor = d.VOLUME_USD
        }
      })

      const dates = Object.keys(groupedByDate).sort()
      const percentages = dates.map((date) => ({
        date,
        percentage:
          (groupedByDate[date].thor / groupedByDate[date].total) * 100,
      }))

      this.thorchainDominance = this.basicChartFormat(
        (value) => `${value.toFixed(1)}%`,
        [
          {
            name: 'THORChain DEX Dominance',
            type: 'line',
            data: percentages.map((d) => d.percentage),
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 2 },
            areaStyle: { color: 'rgba(35, 220, 200, 0.2)' },
          },
        ],
        percentages.map((d) => new Date(d.date).toLocaleDateString()),
        {
          yAxis: [
            {
              type: 'value',
              min: 0,
              max:
                Math.ceil(Math.max(...percentages.map((d) => d.percentage))) *
                1.1,
              axisLabel: {
                formatter: (value) => `${value.toFixed(1)}%`,
              },
            },
          ],
          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
          },
        }
      )
    },
    updateModuleBalances() {
      if (!this.moduleBalancesData) return
      const filteredData = this.getFilteredModuleBalancesData()

      const dates = filteredData.map((d) =>
        new Date(d.DAY).toLocaleDateString()
      )
      const reserveModuleBalance = filteredData.map(
        (d) => d.RESERVE_MODULE_BALANCE
      )
      const bondModuleBalance = filteredData.map((d) => d.BOND_MODULE_BALANCE)
      const poolModuleBalance = filteredData.map((d) => d.POOL_MODULE_BALANCE)
      const totalBalance = filteredData.map(
        (d) =>
          d.RESERVE_MODULE_BALANCE +
          d.BOND_MODULE_BALANCE +
          d.POOL_MODULE_BALANCE
      )

      this.moduleBalances = this.basicChartFormat(
        (value) => `$${(value / 1000000).toFixed(1)}M`,
        [
          {
            name: 'Total Balance',
            type: 'line',
            data: totalBalance,
            itemStyle: { color: '#4A90E2' },
            lineStyle: { width: 2 },
            smooth: true,
            showSymbol: false,
            areaStyle: { color: 'rgba(74, 144, 226, 0.1)' },
          },
          {
            name: 'Reserve Module',
            type: 'line',
            data: reserveModuleBalance,
            itemStyle: { color: '#23DCC8' },
            lineStyle: { width: 2 },
            smooth: true,
            showSymbol: false,
            areaStyle: { color: 'rgba(35, 220, 200, 0.1)' },
          },
          {
            name: 'Bond Module',
            type: 'line',
            data: bondModuleBalance,
            itemStyle: { color: '#FF007A' },
            lineStyle: { width: 2 },
            smooth: true,
            showSymbol: false,
            areaStyle: { color: 'rgba(255, 0, 122, 0.1)' },
          },
          {
            name: 'Pool Module',
            type: 'line',
            data: poolModuleBalance,
            itemStyle: { color: '#FCD403' },
            lineStyle: { width: 2 },
            smooth: true,
            showSymbol: false,
            areaStyle: { color: 'rgba(252, 212, 3, 0.1)' },
          },
        ],
        dates,
        {
          yAxis: [
            {
              type: 'value',
              min: 0,
              max: 261000000,
              axisLabel: {
                color: '#888',
                formatter: (value) => `$${(value / 1000000).toFixed(1)}M`,
              },
              axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
              splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
            },
          ],

          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
          },
          legend: {
            data: [
              'Total Balance',
              'Reserve Module',
              'Bond Module',
              'Pool Module',
            ],
            selected: {
              'Total Balance': false,
            },
          },
        }
      )
    },
    updateAddressesChart() {
      if (!this.addressesData) return
      const filteredData = this.getFilteredAddressesData()

      const labels = filteredData.map((d) =>
        new Date(d.DAY).toLocaleDateString()
      )
      const dailyAddresses = filteredData.map((d) => d.NEW_ADDRESSES)
      const cumulativeAddresses = filteredData.map(
        (d) => d.NEW_ADDRESSES_CUMULATIVE
      )

      const series = this.showDailyAddresses
        ? [
            {
              name: 'New Addresses',
              type: 'bar',
              data: dailyAddresses,
            },
          ]
        : [
            {
              name: 'Total Addresses',
              type: 'line',
              data: cumulativeAddresses,
              lineStyle: { width: 2 },
              smooth: true,
              showSymbol: false,
              areaStyle: { color: 'rgba(44, 190, 140, 0.1)' },
            },
          ]

      this.thorchainAddresses = this.basicChartFormat(
        (value) => value.toLocaleString(),
        series,
        labels,
        {
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: (value) => value.toLocaleString(),
            },
          },
          grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
          },
        }
      )
    },
    toggleAddressesView() {
      this.showDailyAddresses = !this.showDailyAddresses
      this.updateAddressesChart()
    },
    changeTimeframe(newDays) {
      this.days = newDays
      this.updateChart()
    },
    updateChart() {
      this.updateDailyVolume()
      this.updateDailySwappers()
      this.updateDailyDexVolume()
      this.updateThorchainDominance()
      this.updateModuleBalances()
      this.updateAddressesChart()
    },
    getFilteredSwappersData() {
      if (!this.swappersData) return []
      return this.swappersData.slice(-this.days)
    },
    getFilteredModuleBalancesData() {
      if (!this.moduleBalancesData) return []
      return this.moduleBalancesData.slice(-this.days)
    },
    getFilteredAddressesData() {
      if (!this.addressesData || !this.days) return []
      return this.addressesData.slice(-this.days)
    },
    getFilteredVolumeData() {
      if (!this.volumeData) return []
      const uniqueDays = [...new Set(this.volumeData.map((d) => d.DAY))]
      const filteredDays = uniqueDays.slice(-this.days)
      return this.volumeData.filter((d) => filteredDays.includes(d.DAY))
    },
    getFilteredDexVolumeData() {
      if (!this.dexVolumeData) return []
      const uniqueDays = [...new Set(this.dexVolumeData.map((d) => d.DAY))]
      const filteredDays = uniqueDays.slice(-this.days)
      return this.dexVolumeData.filter((d) => filteredDays.includes(d.DAY))
    },
    getTimeframeDisplay(days) {
      return days === 99999 ? 'All Time' : `Last ${days} Days`
    },
  },
}
</script>

<style lang="scss" scoped>
.timeframe-buttons {
  display: flex;
  gap: 0.5rem;
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 10px 8px;
    border-radius: 0.25rem;
    background-color: var(--card-bg-color);
    color: var(--font-color);
    border: none;
    font-size: 0.75rem;
    font-weight: 500;
    transition:
      background-color 0.3s ease,
      transform 0.2s ease;

    &.active {
      color: var(--primary-color);
    }
  }
}
.chart-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.button-address {
  margin: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 10px 8px;
  border-radius: 0.25rem;
  background-color: var(--border-color);
  border: none;
  color: var(--sec-font-color);
  font-size: 0.75rem;
  font-weight: 500;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}
</style>
