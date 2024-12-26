<template> 
  <main
    id="default-layout"
    :class="{
      'long-sidebar': menu,
      fullscreen: fullscreen,
      'show-sidebar': sidebar,
    }"
  >
    <header id="header">
      <searchbar />
    </header>
    <!-- Navbar -->
    <nav id="navbar">
      <navbar />
    </nav>
    <!-- Main content -->
    <main id="main-content">
      <Nuxt />
    </main>
    <!-- Footer -->
    <footer id="footer">
      <Footer />
    </footer>
  </main>
</template>

<script setup>
import { useStore } from 'vuex'
import { ref, onMounted, watch } from 'vue'

const darkMode = ref(false)
const blueElectraMode = ref(false)
const updateInterval = ref()

const store = useStore()

// استفاده از API از طریق Nuxt Plugin
const $api = useNuxtApp().$api()

// محاسبات
const theme = computed(() => store.getters['getTheme'])
const menu = computed(() => store.getters['getIsMenuOn'])
const fullscreen = computed(() => store.getters['getFullScreen'])
const sidebar = computed(() => store.getters['getSidebar'])

// تغییرات Theme
watch(darkMode, () => {
  if (darkMode.value) {
    store.commit('setTheme', true)
  } else {
    store.commit('setTheme', false)
  }
})

watch(blueElectraMode, () => {
  if (blueElectraMode.value) {
    store.commit('setTheme', 'BlueElectra')
  } else {
    store.commit('setTheme', false)
  }
})

// متدهای لایف‌سایکل
onMounted(() => {
  const htmlElement = document.documentElement
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme === 'BlueElectra') {
    blueElectraMode.value = true
    htmlElement.setAttribute('theme', 'BlueElectra')
    store.commit('setTheme', 'BlueElectra')
  } else if (savedTheme === 'light') {
    darkMode.value = false
    htmlElement.setAttribute('theme', 'light')
    store.commit('setTheme', false)
  } else {
    darkMode.value = true
    htmlElement.setAttribute('theme', 'dark')
    store.commit('setTheme', true)
  }

  getRunePrice()
  getNodesData()
  getNetworkData()
  getPoolsData()
  getChainsHeight()

  updateInterval.value = setInterval(() => {
    getChainsHeight()
    getRunePrice()
  }, 20000)

  const changeHeight = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  changeHeight()

  window.addEventListener('resize', changeHeight)
})

onBeforeUnmount(() => {
  clearInterval(updateInterval.value)
})

// متدها
const getNodesData = async () => {
  try {
    const { data } = await $api.getNodes()
    store.commit('setNodesData', data)
  } catch (error) {
    console.error(error)
  }
}

const getNetworkData = async () => {
  try {
    const { data } = await $api.getNetwork()
    store.commit('setNetworkData', data)
  } catch (error) {
    console.error(error)
  }
}

const getPoolsData = async () => {
  try {
    const { data } = await $api.getPools()
    store.commit('setPools', data)
  } catch (error) {
    console.error(error)
  }
}

const getChainsHeight = async () => {
  try {
    const { data } = await $api.getChainsHeight()
    const thorHeight = await $api.getTHORLastBlock()
    store.commit('setChainsHeight', {
      ...data,
      THOR: thorHeight.data,
    })
  } catch (error) {
    console.error(error)
  }
}

const getRunePrice = async () => {
  try {
    const { data } = await $api.getStats()
    store.commit('setRunePrice', parseFloat(data.runePriceUSD))
  } catch (error) {
    console.error(error)
  }
}
</script>

<style lang="scss">
#default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  #footer {
    position: relative;
    margin-top: auto;
  }

  #header {
    top: 0;
    position: sticky;
    z-index: 1000;
    display: flex;
    align-items: center;
    background: var(--color-light);
    grid-area: header;
    border-bottom: 1px solid var(--border-color);
    padding: 0 10px;

    @include lg {
      padding: 0.5rem 3rem;
    }
  }

  #navbar {
    background: var(--color-light);
    border-bottom: 1px solid var(--border-color);
    padding: 0 10px;

    @include lg {
      padding: 0.5rem 3rem;
    }
  }

  #main-content {
    padding-bottom: 10rem;
    padding-top: 32px;
    grid-area: main;

    @include lg {
      padding: 2rem 3rem;
    }
  }
}
</style>
