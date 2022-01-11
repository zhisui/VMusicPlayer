import axios from 'axios'

import { getCookie } from './auth'

// 在本地跑的时候将网易云的API文件改为跑在5000端口，防止项目本地地址和API服务器地址冲突
const baseURL = 'http://localhost:5000/'

// 自定义axios实例
const request = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true, // 许跨域设置，不然可能因为拿不到cookie而报错
})

// 请求拦截器 在请求中加上cookie信息和proxy代理服务器地址
request.interceptors.request.use(
  function (config) {
    if (!config.params) config.params = {}
    if (baseURL[0] !== '/') {
      config.params.cookie = `MUSIC_U=${getCookie('MUSIC_U')}`
    }
    // const proxy = JSON.parse(localStorage.getItem('setting')!).proxyConfig
    // if (['HTTP, HTTPS'].includes(proxy.protocol)) {
    //   config.params.proxy = `${proxy.protocol}://${proxy.server}${proxy.port}`
    // }
    return config
  },
  // 请求失败处理
  async function (error) {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },

  async (error) => {
    return Promise.reject(error)
  }
)

export default request
