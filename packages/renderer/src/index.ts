import { createApp } from 'vue'

import './assets/css/global.scss'

import i18n from './language/i18n'

import App from '/@/App.vue'
import router from '/@/router'

createApp(App).use(router).use(i18n).mount('#app')
