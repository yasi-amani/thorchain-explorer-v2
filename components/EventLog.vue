<template>
  <card>
    <h3 class="header-title">Event Logs</h3>
    <div v-for="(item, index) in items" :key="index" class="simple-log">
      <h3 class="title">{{ item.title }}</h3>
      <div class="details-log">
        <span class="name">{{ item.name }}:</span>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>
  </card>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [
        {
          title: '[0] message',
          name: 'action',
          value: '/ibc.applications.transfer.v1.MsgTransfer',
        },
        {
          title: '[1] coin_spent',
          name: 'sender',
          value: 'kujira1cyglcvuqt5nzvlst6ehhgquhz0c7nzcsnq5cg0',
        },
      ],
    },
  },
}
</script>

<style lang="scss" scoped>
.header-title {
  margin: 0 0 1rem 0;
  color: var(--sec-font-color);
  font-size: 0.875rem;
  font-weight: 600;
}

.simple-log {
  display: flex;
  flex-direction: column;

  .title {
    display: flex;
    width: 100%;
    align-items: center;
    margin: 1rem 0;
    font-size: 0.875rem;
    font-weight: bold;
    color: var(--sec-font-color);
  }

  .details-log {
    display: flex;

    .name {
      font-weight: bold;
      margin-right: 10px;
      padding: 0.25rem;
      color: var(--font-color);
      font-size: 0.875rem;
    }

    .value {
      font-weight: bold;
      padding: 0.25rem;
      color: var(--sec-font-color);
      font-size: 0.875rem;
      word-break: break-word;
    }
  }
}
</style>
