import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: async () => import('../views/home.vue'),
  },
  {
    path: '/explore',
    name: 'explore',
    component: async () => import('../views/explore.vue'),
  },
  {
    path: '/library',
    name: 'library',
    component: async () => import('../views/library.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

export default router
