import { createRouter, createWebHashHistory } from 'vue-router'

import home from '/@/views/home.vue'

const routes = [
  { path: '/', name: 'home', component: home },
  {
    path: '/explore',
    name: 'explore',
    component: async () => import('/@/views/explore.vue'),
  },
  {
    path: '/library',
    name: 'library',
    component: async () => import('/@/views/library.vue'),
  },
  {
    path: '/setting',
    name: 'setting',
    component: async () => import('/@/views/setting.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: async () => import('/@/views/login.vue'),
  },

  {
    path: '/login/account',
    name: 'loginAccount',
    component: async () => import('/@/views/loginAccount.vue'),
  },
  {
    path: '/login/username',
    name: 'loginUsername',
    component: async () => import('/@/views/loginUsername.vue'),
  },
]

export default createRouter({
  routes,
  history: createWebHashHistory(),
})
