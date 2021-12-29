import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
import VueI18n from 'vue-i18n';


import en from './lang/en.js';
import zhCN from './lang/zh-CN.js';
import zhTW from './lang/zh-TW.js';


Vue.use(VueClipboard);
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'zhCN',
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,

  },
  silentTranslationWarn: true,
});

export default i18n;
