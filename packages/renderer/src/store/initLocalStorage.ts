export interface LocalStorage {
  player: object
  setting: {
    proxyConfig: {
      protocol: string
      server: string
      port: null
    }
  }
  data: {
    user: object
    lastRefreshCookieDate: number
    loginMode: string
  }
}

const localStorage: LocalStorage = {
  player: {},
  setting: {
    proxyConfig: {
      protocol: 'noProxy',
      server: '',
      port: null,
    },
  },
  data: {
    user: {},
    lastRefreshCookieDate: 0,
    loginMode: '',
  },
}
export default localStorage
