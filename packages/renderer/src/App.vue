<template>
  <div id="app">
    <NavBar />

    <main>
      <keep-alive>
        <router-view v-if="route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!route.meta.keepAlive"></router-view>
    </main>

    <transition name="slide-up">
      <Player v-if="enablePlayer" v-show="showPlayer" />
    </transition>

    <Toast />
    <ModalNewPlaylist v-if="isAccountLogin()" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ModalNewPlaylist from './components/ModalNewPlaylist.vue'
import Player from './components/Player.vue'
import Toast from './components/Toast.vue'
import { playerStore } from './store/playerStore'
// import { settingStore } from './store/settingStore'
import { isAccountLogin } from './utils/auth'

import NavBar from '@/components/NavBar.vue'

// const isElectron = ref(process.env.IS_ELECTRON)
const storePlayer = playerStore()
const route = useRoute()
const enablePlayer = computed(() => {
  return storePlayer.enabled && route.name !== 'lastfmCallback'
})

// eslint-disable-next-line vue/return-in-computed-property
const showPlayer = computed(() => {
  if (route.name) {
    return (
      ['mv', 'loginUsername', 'login', 'loginAccount', 'lastfmCallback'].includes(
        route.name.toString()
      ) === false
    )
  }
})
</script>

<style lang="scss" scoped>
main {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: auto;
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
}

@media (max-width: 1336px) {
  main {
    padding: 64px 5vw 96px 5vw;
  }
}

main::-webkit-scrollbar {
  width: 0px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s;
}
.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
