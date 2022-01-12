import initLocalStorage from './initLocalStorage'

if (localStorage.getItem('data') === null) {
  localStorage.setItem('data', JSON.stringify(initLocalStorage.data))
}

if (localStorage.getItem('setting') === null) {
  localStorage.setItem('seeting', JSON.stringify(initLocalStorage.setting))
}

export default {
  enableScrolling: true,
  data: JSON.parse(localStorage.getItem('data')!),
  setting: JSON.parse(localStorage.getItem('setting')!),
}
