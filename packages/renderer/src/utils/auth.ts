import Cookies from 'js-cookie'

import store from '../store'

// 未知待写
export function setCookie (key: string) {
  const cookies = key.split(';;')
  console.log(cookies)
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

// 在登录成功状态设有cookie 名MUSIC_U，以下返回true表示处于登录状态
export function isLogin () {
  return getCookie('MUSIC_U') !== undefined
}

export function isAccountLogin () {
  return getCookie('MUSIC_U') !== undefined && store.state.data.loginMode === 'account'
}
