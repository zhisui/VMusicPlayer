import { createStore } from 'vuex'

import Player from '../utils/player'
import actions from './actions'
import mutations from './mutations'
import state from './state'

const store = createStore({
  state,
  mutations,
  actions,
})

let player = new Player()
player = new Proxy(player, {
  set (target, key, valve) {
    target[key] = valve
    if (key === '_howler') return true
    target.saveSelfToLocalStorage()
    target.sendSelfToIpcMain()
    return true
  },
})

store.state.player = player

export default store
