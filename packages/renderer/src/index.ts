import { createApp } from 'vue'

import '@/assets/css/global.scss'

import App from '@/App.vue'
import i18n from '@/plugins/i18n'
import router from '@/router'
import store, { key } from '@/store'

createApp(App).use(router).use(i18n).use(store, key).mount('#app')
