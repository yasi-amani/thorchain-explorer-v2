<template lang="">
  <div class="utility-wrapper">
    <copy :str-copy="value" style="height: 16px" />
    <div class="divider" />
    <qr-btn :qrcode="value" />
  </div>
</template>
<script>
export default {
  props: ['value'],
}
</script>
<style lang="scss">
.utility-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  border-radius: 0.3rem;
  background-color: var(--bg-color);
  height: 1.6rem;

  .divider {
    margin: 0 8px;

    &::after {
      display: block;
      content: ' ';
      border-right: 1px solid var(--border-color);
      height: 16px;
    }
  }
}
</style>
