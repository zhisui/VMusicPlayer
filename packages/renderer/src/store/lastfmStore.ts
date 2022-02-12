import { defineStore } from 'pinia'

export const lastfmStore = defineStore('lastfm', {
  state: () => {
    return {
      key: '',
    }
  },
})
