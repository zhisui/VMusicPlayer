import { createI18n } from 'vue-i18n' // 引入vue-i18n组件

import messages from './lang'

const i18n = createI18n({
  fallbackLocale: 'en',
  locale: 'zhCN',
  messages,
})

export default i18n // 将i18n暴露出去
