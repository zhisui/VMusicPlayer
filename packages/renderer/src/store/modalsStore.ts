import { defineStore } from 'pinia'
export const modalsStore = defineStore('modals', {
  state: () => ({
    addTrackToPlaylistModal: {
      show: false,
      selectedTrackID: 0,
    },
    newPlaylistModal: {
      show: false,
      afterCreateAddTrackID: 0,
    },
  }),
})
