interface UpdateDate {
  key: string
  value: string
}
const mutations = {
  // 账号登录相关，当用户登录之后保存相关登录信息在localStaorage里面
  updateData (state: any, payload: UpdateDate) {
    state.data[payload.key] = payload.value
  },
}

export default mutations
