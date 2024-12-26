import api from '~/api'

export default defineNuxtPlugin(() => {
  return {
    provide: { api: api },
  }
})
