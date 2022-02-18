<template>
  <div id="app">
    <header class="container_header">
      <NavBar />
    </header>
    <main class="container_main">
      <router-view></router-view>
    </main>
    <footer class="container_footer">
      footer
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'

// const isElectron = ref(process.env.IS_ELECTRON)
</script>

<style lang="scss" scoped>
#app {
  width: 100%;
  transition: all 0.4s;
}

.container_header {
  position: sticky;
  top: 0;
}

.container_main {
  flex-grow: 1;
}
</style>
