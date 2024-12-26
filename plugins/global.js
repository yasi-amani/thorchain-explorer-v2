import globalMixin from '~/mixins.js/global'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(globalMixin)
})
