<template>
  <div class="container">
    <!-- 左边箭头 -->
    <div class="nav-arrows">
      <IconButton @click="go('back')">
        <Icon icon="dashicons:arrow-left-alt2" width="26" class="icon" />
      </IconButton>
      <IconButton @click="go('forward')">
        <Icon icon="dashicons:arrow-right-alt2" width="26" class="icon" />
      </IconButton>
    </div>

    <!-- 中间 -->
    <div class="nav-middle">
      <router-link to="/"> 首页 </router-link>
      <router-link to="/explore"> 发现 </router-link>
      <router-link to="/library"> 音乐库 </router-link>
    </div>

    <!-- 右边 -->
    <div class="nav-right">
      <div class="search-container" :class="{ active: inputFocus }">
        <Icon icon="fa-solid:search" class="search-icon" width="18" />
        <input
          v-model="keywords"
          type="search"
          :placeholder="inputFocus ? '' : '搜索'"
          @blur="inputFocus = false"
          @focus="inputFocus = true"
          @keydown.enter="doSearch"
        />
      </div>
      <div class="drop">
        <img
          class="avatar"
          :src="avatarUrl"
          tabindex="-1"
          @click="showMenu = true"
          @blur="showMenu = false"
        />
        <DropdownMenu v-show="showMenu">
          <div class="item" @mousedown="toSetting">
            <Icon icon="uiw:setting" class="icon" />
            设置
          </div>
          <div class="item" @mousedown="toLogin">
            <Icon icon="ls:login" class="icon" />
            登录
          </div>
          <!-- 退出的情况待写 -->
          <div class="item" @mousedown="toGithub">
            <Icon icon="grommet-icons:github" class="icon" />
            Github
          </div>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DropdownMenu from './DropdownMenu.vue'
import IconButton from './IconButton.vue'

import { userDataStore } from '@/store/userData'

const inputFocus = ref(false)
const showMenu = ref(false)
const keywords = ref('')

const store = userDataStore()
const router = useRouter()

const go = (where: 'back' | 'forward') => {
  if (where === 'back') {
    router.go(-1)
  } else {
    router.go(1)
  }
}

const doSearch = () => {
  console.log('ssss')
}

const toSetting = () => {
  router.push({ name: 'setting' })
}

const toLogin = () => {
  router.push({ name: 'login' })
}

const toGithub = () => {
  window.open('https://github.com/zhisui/VMusicPlayer')
}

const avatarUrl = computed(() => {
  return store.user?.avatarUrl
    ? `${store.user?.avatarUrl}?param=512y512`
    : 'http://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=60y60'
})
</script>

<style lang="scss" scoped>
.container {
  align-items: center;
  display: flex;
  justify-content: space-between;
  height: 64px;
  backdrop-filter: saturate(180%) blur(20px);
  background-color: var(--nav-bg-color);
  z-index: 100;
  padding: {
    right: 10vw;
    left: 10vw;
  }
}

.nav-arrows {
  display: flex;
  align-items: center;
}

.nav-middle {
  display: flex;
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

.nav-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .search-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 32px;
    width: 200px;
    background: var(--second-bg-color-transparent);
    border-radius: 8px;
    padding: 0px 5px;
    .search-icon {
      color: var(--text-color);
      opacity: 0.35;
    }
    input {
      font-size: 16px;
      font-weight: 800;
      border: none;
      width: 90%;
      outline: none;
      margin: {
        left: 2px;
      }
      background: transparent;
      color: var(--text-color);
    }
  }

  .active {
    background-color: var(--primary-bg-color);
    .search-icon {
      color: var(--primary-color);
      opacity: 1;
    }
  }

  .avatar {
    height: 30px;
    width: 30px;
    margin-left: 12px;
    background-color: rgba(80, 80, 77, 0.533);
    border-radius: 50%;
  }
  .drop {
    position: relative;
  }
  .item {
    font-size: 14px;
    font-weight: 800;
    border-radius: 7px;
    cursor: default;
    color: var(--text-color);
    display: flex;
    align-items: center;
    padding: 7px;
    &:hover {
      background-color: var(--dropdown-hover-color);
      color: white;
    }
  }
  .icon {
    margin-right: 5px;
    width: 16px;
    height: 16px;
    &:hover {
      color: white;
    }
  }
}
</style>
