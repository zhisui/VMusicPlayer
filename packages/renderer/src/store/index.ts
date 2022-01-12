import { createStore } from 'vuex'

import actions from './actions'
import mutations from './mutations'
import state from './state'

const store = createStore({
  state,
  mutations,
  actions,
})

export default store
