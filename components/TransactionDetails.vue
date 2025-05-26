<template>
  <card class="transaction-details-container">
    <div class="details-grid">
      <div class="detail-row">
        <span class="detail-label">Tx hash:</span>
        <div class="transaction-hash">{{ hash }}</div>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span :class="['mini-bubble green']">{{ status || '-' }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Network:</span>
        <span class="detail-value">{{ network }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Block:</span>
        <span class="detail-value">{{ formatNumber(block) }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Timestamp:</span>
        <span class="detail-value">{{ formatDate(timestamp) }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Fee:</span>
        <span class="detail-value">{{ fee }} KUJI</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Gas:</span>
        <span class="detail-value"
          >{{ formatNumber(gasUsed) }} / {{ formatNumber(gasRequested) }}</span
        >
        <span class="gas-info">(used / requested)</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Memo:</span>
        <span class="detail-value">{{ memo || '-' }}</span>
      </div>
    </div>
  </card>
</template>

<script>
export default {
  name: 'TransactionDetails',
  props: {
    hash: {
      type: String,
      default:
        '6TEBB0EB1F11C8402ABFB18D54ABC6F2C3CA01E8DF23F2ED5064A02A778DAE0',
    },
    status: {
      type: String,
      default: 'success',
    },
    network: {
      type: String,
      default: 'kalyo-1',
    },
    block: {
      type: Number,
      default: 31815704,
    },
    timestamp: {
      type: String,
      default: '2025-05-20T20:49:00',
    },
    fee: {
      type: String,
      default: '0.000954',
    },
    gasUsed: {
      type: Number,
      default: 91907,
    },
    gasRequested: {
      type: Number,
      default: 95382,
    },
    memo: {
      type: String,
      default: '-',
    },
  },
  computed: {
    statusClass() {
      return this.status ? 'info' : 'empty'
    }
  },
  methods: {
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')

      return `${day}/${month}/${year}, ${hours}:${minutes}`
    },
  },
}
</script>

<style lang="scss" scoped>
.transaction-hash {
  font-weight: 600;
  color: var(--sec-font-color);
  line-height: 1.4;
  display: flex;
  align-items: center;
  word-break: break-all;
  font-size: $font-size-s;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  line-height: 1.5;
}

.detail-label {
  font-weight: 500;
  min-width: 90px;
  font-size: $font-size-s;
}

.detail-value {
  margin-left: 10px;
  color: var(--sec-font-color);
  font-size: $font-size-sm;
  font-weight: 400;
}

.gas-info {
  font-size: $font-size-s;
  margin-left: 5px;
  font-weight: 400;
}

.status-bubble.empty {
  color: var(--sec-font-color);
  background: transparent;
  padding: 0;
  border-radius: 0;
}
</style>