interface UpdateDate {
  key: string
  value: string
}

interface UpdateLikedXXX {
  name: string
  data: any
}
const mutations = {
  // 账号登录相关，当用户登录之后保存相关登录信息
  updateData (state: any, payload: UpdateDate) {
    state.data[payload.key] = payload.value
    // console.log(state.data);
  },

  updateLikedXXX (state: any, payload: UpdateLikedXXX) {
    state.liked[payload.name] = payload.data
    if (payload.name === 'songs') {
      state.player.sendSelfToIpcMain()
      console.log(state)
    }
  },
}

export default mutations
