import { createI18n } from 'vue-i18n'

const en = {
  nav: {
    home: 'Home',
    expore: 'Explore',
    library: 'Library',
    search: 'Search',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    github: 'Github Repository',
  },
}

const zh_CN = {
  nav: {
    home: '首页',
    explore: '发现',
    library: '音乐库',
    search: '搜索',
    settings: '设置',
    logout: '登录',
    login: '退出',
    github: 'Github仓库',
  },
}
const messages = { en, zh_CN }
const i18n = createI18n({
  legacy: false,
  locale: 'zh_CN',
  globalInjection: true,
  messages,
})
export default i18n
