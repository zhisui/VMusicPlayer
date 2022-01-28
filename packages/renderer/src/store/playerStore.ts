import { defineStore } from 'pinia'

import Player from '../utils/Player'

const playerStore = defineStore('player', {
  // arrow function recommended for full type inference
  state: () => {
    return {
      player: {},
    }
  },
})

let player = new Player()
player = new Proxy(player, {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  set (target: any, key: string, valve: unknown) {
    target[key] = valve
    if (key === '_howler') return true
    target.saveSelfToLocalStorage()
    target.sendSelfToIpcMain()
    return true
  },
})
const store = playerStore()
store.$state.player = player
