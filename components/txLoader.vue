<template>
  <div>
    <div class="tx-container">
      <div class="swap">
        <div class="amount">
          <skeleton-loader :style="{ width: '4rem' }" />
        </div>
        <div class="value">
          <skeleton-loader :style="{ width: '7rem' }" />
        </div>
      </div>

      <div class="tx-details">
        <div>
          <skeleton-loader
            class="skeleton"
            :style="{ height: '36px', width: '36px', borderRadius: '50%' }"
          />
        </div>
        <div style="width: 100%">
          <skeleton-loader class="skeleton" width="100%" height="2px" />
        </div>
        <div>
          <skeleton-loader
            class="skeleton"
            :style="{ height: '32px', width: '32px', borderRadius: '50%' }"
          />
        </div>
        <div style="width: 100%">
          <skeleton-loader class="skeleton" width="100%" height="2px" />
        </div>
        <div>
          <skeleton-loader
            class="skeleton"
            :style="{ height: '36px', width: '36px', borderRadius: '50%' }"
          />
        </div>
      </div>

      <div class="tx-value">
        <div>
          <skeleton-loader :style="{ width: '7rem' }" />
          <skeleton-loader :style="{ width: '3.5rem' }" />
        </div>
        <div style="display: flex; flex-direction: column; align-items: end">
          <skeleton-loader :style="{ width: '7rem' }" />
          <skeleton-loader :style="{ width: '3.5rem' }" />
        </div>
      </div>

      <div style="margin-top: 3rem"></div>

      <div v-for="i in 3" :key="i" class="section">
        <skeleton-loader :style="{ width: '4rem' }" />
        <div class="line"></div>
        <div class="section-item">
          <skeleton-loader />
          <skeleton-loader />
          <skeleton-loader />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.skeleton {
  margin: 0px !important;
}
.tx-container {
  padding: 20px;
  border-radius: 10px;
  max-width: 640px;
  margin: auto;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
}

.tx-details,
.tx-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  margin: 10px;
}

.swap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.line {
  border-bottom: 1px solid var(--border-color);
  margin: 0.5rem 0 10px;
  padding: 0;
}

.section {
  margin-top: 2rem;
}

.section-item {
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0 5px;
}
</style>
