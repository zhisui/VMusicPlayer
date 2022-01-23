import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'

import Player from '../utils/Player'
import actions from './actions'
import mutations from './mutations'
import { State, state } from './state'
// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<State>> = Symbol()
const store = createStore<State>({
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

export function useStore () {
  return baseUseStore(key)
}
