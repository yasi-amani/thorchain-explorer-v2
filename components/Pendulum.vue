<template>
  <card :is-loading="loading">
    <div class="balance-container">
      <div class="scale">
        <div
          class="arm"
          :class="{ animated: animationActive }"
          :style="{ transform: `translateX(-50%) rotate(${armRotation}deg)` }"
        ></div>
        <div class="pivot"></div>
        <div class="side nodes">
          <div class="label">Active Nodes</div>
          <div class="value">{{ activeNodes }}</div>
        </div>
        <div class="side pooled">
          <div class="label">Pooled</div>
          <div class="value">{{ (standbyNodeCount / 1e8) | number('0a') }}</div>
        </div>
      </div>
      <div class="info-section">
        <div class="status">Overbonded</div>
        <div class="info">
          Liquidity earning {{ poolShareFactor | percent }} of rewards
        </div>
      </div>
    </div>
  </card>
</template>

<script>
export default {
  name: 'BalanceScale',
  data() {
    return {
      loading: true,
      activeNodes: 0,
      standbyNodeCount: 0,
      nodes: [],
      network: [],
      poolShareFactor: 0,
      animationActive: true,
      fixedRotation: 10,
    }
  },
  computed: {
    armRotation() {
      if (this.animationActive) {
        const activeWeight = this.activeNodes
        const pooledWeight = this.standbyNodeCount / 1e8
        const balance = pooledWeight - activeWeight
        return balance > 0
          ? Math.min(balance * 0.5 + 10, 15)
          : Math.max(balance * 0.5, -15)
      }
      return 8
    },
  },
  mounted() {
    this.loadData()
    setTimeout(() => {
      this.fixedRotation = 0
      this.animationActive = false
    }, 5000)
  },
  methods: {
    async loadData() {
      try {
        this.loading = true
        const nodesResponse = await this.$api.getNodes()
        const networkResponse = await this.$api.getNetwork()
        this.nodes = nodesResponse.data
        this.activeNodes = this.nodes.filter(
          (n) => n.status === 'Active'
        ).length
        this.network = networkResponse.data
        this.standbyNodeCount = this.network.totalPooledRune
        this.poolShareFactor = this.network.poolShareFactor
        this.loading = false
      } catch (error) {
        console.error('Error fetching data:', error)
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.balance-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--sec-font-color);
  padding: 20px;
  border-radius: 12px;

  .scale {
    width: 100%;
    max-width: 300px;
    height: 200px;
    position: relative;
    margin-bottom: 20px;
    @keyframes sway {
      0%,
      100% {
        transform: translateX(-50%) rotate(3deg);
      }

      25% {
        transform: translateX(-50%) rotate(-2deg);
      }

      50% {
        transform: translateX(-50%) rotate(3deg);
      }

      75% {
        transform: translateX(-50%) rotate(0deg);
      }
    }

    .arm {
      width: 280px;
      height: 8px;
      background: var(--primary-color);
      position: absolute;
      top: 28%;
      left: 50%;
      transform-origin: center;
      border-radius: 4px;
      box-shadow:
        0 4px 8px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, 0.1);
      transition: transform 0.5s ease;

      &.animated {
        animation: sway 2s ease-in-out infinite;
      }
    }

    .pivot {
      width: 11px;
      height: 161px;
      background: var(--primary-color);
      position: absolute;
      top: 68%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%) rotateX(15deg);
      border-radius: 0.5rem;
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.4),
        inset 0 -2px 6px rgba(255, 255, 255, 0.2);
    }

    .side {
      display: flex;
      flex-direction: column;
      width: 100px;
      height: 40px;
      background-color: var(--border-color);
      border-radius: 0 0 40px 40px;
      position: absolute;
      top: 105px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-color);
      transform: rotateX(20deg) translateZ(10px);

      &.nodes {
        left: 35px;
        width: 5.5rem;
        transform: translateX(-50%) rotateX(20deg) translateZ(10px) rotate(8deg);
        top: 74px;
      }

      &.pooled {
        right: 35px;
        width: 5.5rem;
        transform: translateX(50%) rotateX(20deg) translateZ(10px) rotate(8deg);
      }

      .label {
        font-size: 10px;
        margin-bottom: 5px;
        color: var(--sec-font-color);
      }

      .value {
        font-size: 12px;
        font-weight: bold;
        color: var(--sec-font-color);
      }
    }
  }

  .info-section {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .status {
      font-size: 20px;
      font-weight: bold;
      color: var(--primary-color);
    }

    .info {
      font-size: 16px;
      color: var(--sec-font-color);
    }
  }
}
</style>
