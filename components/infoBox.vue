<template>
  <div class="box-container">
    <div class="info-box">
      <div
        v-for="(option, index) in options"
        :key="index"
        class="info-item"
        :style="{
          backgroundColor: option.backgroundColor || backgroundColor,
          color: option.textColor || textColor,
          height: option.height || 'auto',
          width: option.width || 'auto',
          gridColumn: option.gridColumn,
          gridRow: option.gridRow,
          border: option.border,
        }"
      >
        <div
          v-for="(item, idx) in option.items"
          :key="idx"
          class="item-content"
        >
          <span v-if="item.filter">{{ item.filter(item.value) }}</span>
          <span v-else>{{ item.value || '-' }}</span>
          <span class="item-name" v-if="item.name">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoBox',
  props: {
    options: {
      type: Array,
      required: true,
      default: () => [],
    },
    backgroundColor: {
      type: String,
      default: 'var(--border-color)',
    },
    textColor: {
      type: String,
      default: 'var(--sec-font-color)',
    },
  },
}
</script>

<style scoped lang="scss">
.box-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 36vh;
  padding: 20px;

  .info-box {
    display: grid;
    gap: 0.8rem;
    overflow-y: auto;
    padding: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
    transition: all 0.3s ease;

    .item-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
