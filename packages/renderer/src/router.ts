const routes = [
  {
    path: '/',
    name: 'home',
    component: async () => import('@/views/home.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/explore',
    name: 'explore',
    component: async () => import('@/views/explore.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/library',
    name: 'library',
    component: async () => import('@/views/library.vue'),
  },
  {
    path: '/library/liked-songs',
    name: 'likedSongs',
    component: async () => import('@/views/playlist.vue'),
  },
  {
    path: '/setting',
    name: 'setting',
    component: async () => import('@/views/setting.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: async () => import('@/views/login.vue'),
  },

  {
    path: '/login/account',
    name: 'loginAccount',
    component: async () => import('@/views/loginAccount.vue'),
  },
  {
    path: '/login/username',
    name: 'loginUsername',
    component: async () => import('@/views/loginUsername.vue'),
  },
  {
    path: '/search/:keywords?',
    name: 'search',
    component: async () => import('@/views/search.vue'),
    meta: {
      keepAlive: true,
    },
  },

  {
    path: '/search/:keywords/:type',
    name: 'searchType',
    component: async () => import('@/views/searchType.vue'),
  },

  {
    path: '/album/:id',
    name: 'album',
    component: async () => import('@/views/album.vue'),
  },

  {
    path: '/playlist/:id',
    name: 'playlist',
    component: async () => import('@/views/playlist.vue'),
  },

  {
    path: '/artist/:id',
    name: 'artist',
    component: async () => import('@/views/artist.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },

  {
    path: '/mv/:id',
    name: 'mv',
    component: async () => import('@/views/mv.vue'),
  },

  {
    path: '/next',
    name: 'next',
    component: async () => import('@/views/next.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },

  {
    path: '/daily/songs',
    name: 'dailySongs',
    component: async () => import('@/views/dailyTracks.vue'),
    meta: {
      requireAccountLogin: true,
    },
  },
]

export default routes
