import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import '@/assets/css/global.scss'

import App from '@/App.vue'
import i18n from '@/plugins/i18n'
import routes from '@/router'

export const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(
    createRouter({
      routes,
      history: createWebHashHistory(),
    })
  )
  .use(i18n)
  .mount('#app')
