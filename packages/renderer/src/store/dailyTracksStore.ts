import { defineStore } from 'pinia'

export const dailyTracksStore = defineStore('dailyTacks', {
  state: () => {
    return {
      dailyTracks: [{ id: 0, al: { picUrl: '' } }],
    }
  },
})
