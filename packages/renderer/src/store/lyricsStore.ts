import { defineStore } from 'pinia'

export const lyricsStore = defineStore('lyrics', {
  state: () => {
    return {
      showLyrics: false,
    }
  },
})
