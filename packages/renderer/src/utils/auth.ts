import Cookies from 'js-cookie'

import { userDataStore } from '../store/userData'

import { logout } from '@/api/auth'

export function setCookie (key: string) {
  const cookies = key.split(';;')
  cookies.forEach((cookie) => {
    document.cookie = cookie
    const cookieKeyValue = cookie.split(';')[0].split('=')
    localStorage.setItem(`cookie-${cookieKeyValue[0]}`, cookieKeyValue[1])
  })
}

export function getCookie (key: string) {
  return Cookies.get(key) ?? localStorage.getItem(`cookie-${key}`)
}

export function removeCookie (key: string) {
  Cookies.remove(key)
  localStorage.removeItem(`cookie-${key}`)
}

// 在登录成功后后服务器会返回cookie,可将cookie写入本地
export function isLogin () {
  return getCookie('MUSIC_U') !== undefined
}

export function isAccountLogin () {
  const store = userDataStore()
  return getCookie('MUSIC_U') !== undefined && store.loginMode === 'account'
}

export function doLogout () {
  logout()
  removeCookie('MUSIC_U')
  removeCookie('__csrf')
  const storeUser = userDataStore()
  // 更新状态仓库中的用户信息
  storeUser.user = {}
  // 更新状态仓库中的登录状态
  storeUser.loginMode = ''
  // 更新状态仓库中的喜欢列表
  storeUser.likedSongPlaylistID = undefined
}
