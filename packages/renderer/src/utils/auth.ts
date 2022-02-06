import Cookies from 'js-cookie'

import { userDataStore } from '../store/userData'

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
