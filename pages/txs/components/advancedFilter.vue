<template>
  <div>
    <button class="advanced-filter" @click="toggleModal">
      <FilterIcon class="filter-icon" />
      Advanced Filter
      <span v-if="submittedCount > 0" :class="'mini-bubble'">{{
        submittedCount
      }}</span>
    </button>
    <div
      v-if="isModalVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Advanced Filters</h3>
          <CrossIcon class="close-btn" @click="toggleModal" />
        </div>
        <div class="input-fields">
          <div class="input-row">
            <input-filter
              :tags="filters.addresses"
              placeholder="Enter Addresses, press enter"
              :label="filterLabels.addresses"
              @update:tags="updateTags('addresses', $event)"
            />
          </div>

          <div class="input-row">
            <input-filter
              :tags="filters.affiliate"
              placeholder="Enter Affiliate, press enter"
              :label="filterLabels.affiliate"
              @update:tags="updateTags('affiliate', $event)"
            />
            <input-filter
              :tags="filters.asset"
              placeholder="Enter Asset, press enter"
              :label="filterLabels.asset"
              :suggestions="assets"
              @update:tags="updateTags('asset', $event)"
            />
          </div>

          <div class="input-row">
            <div class="input-group">
              <label for="fromHeight">{{ filterLabels.fromHeight }}</label>
              <input
                id="fromHeight"
                v-model="filters.fromHeight"
                type="text"
                placeholder="Enter fromHeight, press enter"
                :disabled="isDateFilled"
              />
            </div>
            <div class="input-group">
              <label for="toHeight">{{ filterLabels.toHeight }}</label>
              <input
                id="toHeight"
                v-model="filters.toHeight"
                type="text"
                placeholder="Enter toHeight, press enter"
                :disabled="isDateFilled"
              />
            </div>
          </div>

          <div class="input-row">
            <select-filter
              :options="getOptions('type')"
              :default="filters.type"
              :label="filterLabels.type"
              @update:selectedOptions="selectOption('type', $event)"
            />
            <select-filter
              :options="getOptions('txType')"
              :default="filters.txType"
              :label="filterLabels.txType"
              @update:selectedOptions="selectOption('txType', $event)"
            />
          </div>

          <div class="input-row">
            <div class="input-group">
              <label for="date">{{ filterLabels.date }}</label>
              <date-picker
                id="date"
                v-model="filters.dateValue"
                placeholder="Select date range"
                value-type="timestamp"
                :range="true"
                :disabled="isHeightFilled"
              />
            </div>
          </div>
        </div>

        <div class="button-group">
          <button
            :disabled="!isFormValid()"
            :class="{ 'disabled-btn': !isFormValid() }"
            @click="submitForm"
          >
            Submit
          </button>
          <button @click="resetForm">Clear</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker'
import CrossIcon from '~/assets/images/cross.svg?inline'
import FilterIcon from '~/assets/images/filter.svg?inline'

export default {
  name: 'Filter',
  components: {
    CrossIcon,
    FilterIcon,
    DatePicker,
  },
  data() {
    return {
      isModalVisible: false,
      submittedCount: 0,
      filters: {
        addresses: [],
        txId: [],
        asset: [],
        type: [],
        txType: [],
        affiliate: [],
        toHeight: '',
        fromHeight: '',
        dateValue: [null, null],
      },
      filterLabels: {
        addresses: 'Addresses',
        txId: 'TX ID',
        asset: 'Asset',
        type: 'Type',
        txType: 'TxType',
        affiliate: 'Affiliate',
        toHeight: 'To Height',
        fromHeight: 'From Height',
        date: 'Date Range',
      },
    }
  },
  computed: {
    filledFilterCount() {
      let count = 0
      if (this.filters.addresses.length > 0) count++
      if (this.filters.txId.length > 0) count++
      if (this.filters.affiliate.length > 0) count++
      if (this.filters.asset.length > 0) count++
      if (this.filters.type.length > 0) count++
      if (this.filters.txType.length > 0) count++
      if (this.filters.toHeight) count++
      if (this.filters.fromHeight) count++
      if (
        this.filters.dateValue.length > 0 &&
        this.filters.dateValue[0] != null
      )
        count++
      return count
    },
    isHeightFilled() {
      return (
        this.filters.toHeight.trim() !== '' ||
        this.filters.fromHeight.trim() !== ''
      )
    },
    isDateFilled() {
      return (
        this.filters.dateValue[0] !== null && this.filters.dateValue[1] !== null
      )
    },
    assets() {
      const pools = this.$store.state.pools
      if (pools) {
        const poolsMap = pools
          .map((p) => p.asset)
          .flatMap((a) => [
            a,
            a.replace('.', '/'),
            a.replace('.', '~'),
            a.replace('.', '-'),
          ])

        return [...poolsMap, 'THOR.RUNE']
      }

      return []
    },
  },
  methods: {
    toggleModal() {
      this.isModalVisible = !this.isModalVisible
    },

    handleOverlayClick(event) {
      if (event.target === event.currentTarget) {
        this.toggleModal()
      }
    },

    selectOption(key, options) {
      this.filters[key] = options
    },

    updateTags(type, tags) {
      this.filters[type] = tags
    },

    submitForm() {
      if (this.isFormValid()) {
        this.$emit('applyFilters', this.filters)
        this.showBadge = true
        this.toggleModal()
      }
    },

    resetForm() {
      this.filters = {
        addresses: [],
        txId: [],
        asset: [],
        type: [],
        txType: [],
        affiliate: [],
        toHeight: '',
        fromHeight: '',
        dateValue: [null, null],
      }
      this.submittedCount = this.filledFilterCount
      this.$emit('clearfilter')
    },

    resetFilter(filter) {
      this.filters = {
        addresses: [],
        txId: [],
        asset: [],
        type: [],
        txType: [],
        affiliate: [],
        toHeight: '',
        fromHeight: '',
        dateValue: [null, null],
        ...filter,
      }
      this.submittedCount = this.filledFilterCount
    },

    queryToFilter(query) {
      const filters = {}
      for (const k in query) {
        filters[k] = query[k].split(',')
      }
      this.filters = {
        addresses: [],
        txId: [],
        asset: [],
        type: [],
        txType: [],
        affiliate: [],
        toHeight: '',
        fromHeight: '',
        dateValue: [null, null],
        ...filters,
      }
      this.submittedCount = this.filledFilterCount
    },

    getOptions(key) {
      return key === 'type'
        ? [
            'swap',
            'addLiquidity',
            'withdraw',
            'donate',
            'refund',
            'switch',
            'thorname',
            'runePoolDeposit',
            'runePoolWithdraw',
            'bond',
            'unbond',
            'trade',
            'secure',
          ]
        : [
            'unknown',
            'add',
            'withdraw',
            'swap',
            'limitOrder',
            'outbound',
            'donate',
            'bond',
            'unbond',
            'leave',
            'yggdrasilFund',
            'yggdrasilReturn',
            'reserve',
            'refund',
            'migrate',
            'ragnarok',
            'switch',
            'noOp',
            'consolidate',
            'thorname',
            'loanOpen',
            'loanRepayment',
          ]
    },

    isFormValid() {
      const valid =
        this.filters.addresses.length > 0 ||
        this.filters.txId.length > 0 ||
        this.filters.affiliate.length > 0 ||
        this.filters.asset.length > 0 ||
        this.filters.type.length > 0 ||
        this.filters.txType.length > 0 ||
        this.filters.toHeight.trim() !== '' ||
        this.filters.fromHeight.trim() !== '' ||
        (this.filters.dateValue.length > 0 && this.filters.dateValue[0] != null)

      if (
        (this.filters.toHeight.trim() !== '' ||
          this.filters.fromHeight.trim() !== '') &&
        this.filters.dateValue?.length > 0
      )
        return false

      return valid
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg-color);
  border-radius: $radius-lg;
  text-align: left;
  color: var(--sec-font-color);
  width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);

  > div {
    padding: $space-18;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: $space-10;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: $font-size-md;
  margin: $space-0;
  color: var(--sec-font-color);
}

.advanced-filter {
  display: flex;
  align-items: center;
  padding: $space-10 $space-8;
  font-size: $font-size-sm;
  background-color: var(--card-bg-color);
  color: var(--font-color);
  border: 1px solid var(--border-color);
  border-radius: $radius-s;
  cursor: pointer;
  width: auto;
  margin: $space-8;
  white-space: nowrap;
  font-weight: 450;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;

  .filter-icon {
    width: 1.2rem;
    height: 1.2rem;
    margin-right: $space-5;
  }

  &:hover {
    background-color: var(--active-bg-color);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
    color: var(--sec-font-color);
  }
}

.mini-bubble {
  font-size: $font-size-xs;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: $space-5;
}

.close-btn {
  cursor: pointer;
  width: 1.5rem;
  height: 2rem;
  color: var(--sec-font-color);

  &:hover {
    color: var(--primary-color);
  }
}

.input-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-grow: 1;
  width: 100%;

  label {
    font-size: $font-size-desktop;
    font-weight: bold;
    color: var(--sec-font-color);
    margin-bottom: $space-8;
  }

  input {
    height: 38px;
    color: var(--sec-font-color) !important;
    background-color: var(--bg-color) !important;
    border-radius: $radius-lg;
    border: 1px solid var(--border-color) !important;
    padding: $space-8;
    font-size: $font-size-sm;
    outline: none;
    flex-grow: 1;
  }

  input:-webkit-autofill,
  input:-moz-autofill,
  input:-ms-autofill {
    background-color: var(--bg-color) !important;
    color: var(--sec-font-color) !important;
    caret-color: var(--sec-font-color);
  }

  input:-webkit-autofill {
    -webkit-text-fill-color: var(--sec-font-color) !important;
    transition: background-color 5000s ease-in-out 0s;
    caret-color: var(--sec-font-color);
  }
}

.button-group {
  display: flex;
  justify-content: center;
  padding-top: $space-20;
  border-top: 1px solid var(--border-color);

  button {
    background-color: var(--bg-color);
    border-radius: $radius-lg;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $space-10 $space-20;
    color: var(--font-color);
    cursor: pointer;
    font-size: $font-size-sm;
    font-weight: 500;
    margin-left: $space-8;

    &:hover {
      color: var(--primary-color);
      background-color: var(--active-bg-color);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
  }

  button:disabled,
  .disabled-btn {
    background-color: var(--bg-color);
    cursor: not-allowed;
  }
}
</style>
