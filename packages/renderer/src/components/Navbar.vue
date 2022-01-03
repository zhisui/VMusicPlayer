<template>
  <div class="container">
    <!-- 左边箭头 -->
    <div class="nav-arrows">
      <iconButton>
        <Icon icon="dashicons:arrow-left-alt2" width="30" class="icon" />
      </iconButton>
      <iconButton>
        <Icon icon="dashicons:arrow-right-alt2" width="30" class="icon" />
      </iconButton>
    </div>
    <!-- 中间 -->
    <div class="nav-middle">
      <router-link to="/home">
        首页
      </router-link>
      <router-link to="/explore">
        发现
      </router-link>
      <router-link to="/library">
        音乐库
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Icon } from '@iconify/vue'
import { defineComponent } from 'vue'

import IconButton from './IconButton.vue'
export default defineComponent({
  name: 'NavBar',
  components: {
    IconButton,
    Icon,
  },
  data () {
    return {
      inputFocus: false,
      langs: ['zh-CN', 'zh-TW', 'en'],
      keywords: '',
    }
  },
})
</script>

<style lang="scss" scoped>
.container {
  align-items: center;
  display: flex;
  justify-content: space-around;
  height: 64px;
  z-index: 100;
  padding: {
    right: 10vw;
    left: 10vw;
  }
  .nav-arrows {
    display: flex;
    flex: 1;
    align-items: center;
  }
  button {
    -webkit-app-region: no-drag;
  }
}
.nav-middle {
  display: flex;
  /* flex: 1; */
  justify-content: center;
  text-transform: uppercase;
  user-select: none; //文本不可选中复制
  a {
    -webkit-app-region: no-drag;
    font-size: 18px;
    font-weight: 900;
    text-decoration: none;
    border-radius: 6px;
    padding: 6px 10px;
    color: var(--text-color);
    transition: all 0.2s;
    -webkit-user-drag: none;
    margin: {
      right: 12px;
      left: 12px;
    }
    &:hover {
      background-color: var(--btn-hover-color);
      transition: all 0.2s;
    }
    &:active {
      transform: scale(0.92);
      transtion: all 0.2s;
    }
    &.router-link-active {
      color: var(--primary-color);
    }
  }
}
</style>
