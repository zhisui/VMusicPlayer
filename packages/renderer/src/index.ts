import { createApp } from 'vue'

import './assets/css/global.scss'

// import i18n from './locales/i18n'
import i18n from './plugins/i18n'
import store from './store'

import App from '/@/App.vue'
import router from '/@/router'

createApp(App).use(router).use(i18n).use(store).mount('#app')
