<template>
  <div class="container">
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

<script lang="ts">
import { defineComponent } from 'vue'

import NavBar from '/@/components/NavBar.vue'

export default defineComponent({
  name: 'App',
  components: {
    NavBar,
  },
})
</script>

<style scoped>
.container_header .container_footer {
  flex-shrink: 0;
}
.container_main {
  flex-grow: 1;
}
</style>
