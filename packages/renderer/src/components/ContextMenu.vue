<template>
  <div ref="contextMenu" class="context-menu">
    <div
      v-if="showMenu"
      ref="menu"
      class="menu"
      tabindex="0"
      :style="{ top: top + 'px', left: left + 'px' }"
      @blur="closeMenu"
      @click="closeMenu"
    >
      <slot class="item"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, defineExpose, nextTick, ref } from 'vue'

import { playerStore } from '../store/playerStore'
const showMenu = ref(false)
const top = ref(0)
const left = ref(0)
const player = playerStore()
const menu = ref()
const emit = defineEmits<{
  (e: 'closeMenu'): void
}>()

const setMenu = (y: number, x: number) => {
  const heightOffset = player.enabled ? 64 : 0
  const largestHeight = window.innerHeight - menu.value.offsetHeight - heightOffset
  const largestWidth = window.innerWidth - menu.value.offsetWidth - 25
  if (top.value > largestHeight) top.value = largestHeight
  if (left.value > largestWidth) left.value = largestWidth
  top.value = y
  left.value = x
}

const closeMenu = () => {
  showMenu.value = false
  if (emit('closeMenu') !== undefined) {
    emit('closeMenu')
  }
}

const openMenu = (e: MouseEvent) => {
  showMenu.value = true
  nextTick(() => {
    menu.value.focus()
    setMenu(e.y, e.x)
  })
  e.preventDefault()
}

defineExpose({
  openMenu,
})
</script>

<style lang="scss">
.context-menu {
  width: 100%;
  height: 100%;
  user-select: none;
}

.menu {
  position: fixed;
  min-width: 136px;
  max-width: 240px;
  list-style: none;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 6px 12px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  box-sizing: border-box;
  padding: 6px;
  z-index: 1000;
  -webkit-app-region: no-drag;
  outline: none;

  &:focus {
    outline: none;
  }

  .item {
    font-weight: 600;
    font-size: 14px;
    padding: 10px 14px;
    border-radius: 7px;
    cursor: default;
    color: var(--text-color);
    display: flex;
    align-items: center;
    &:hover {
      color: var(--primary-color);
      background: var(--dropdown-hover-color);
    }
  }
}

[data-theme='dark'] {
  .menu {
    background: rgba(36, 36, 36, 0.78);
    backdrop-filter: blur(16px) contrast(120%);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .menu .item:hover {
    color: var(--text-color);
  }
}

@supports (-moz-appearance: none) {
  .menu {
    background-color: var(--dropdown-hover-color) !important;
  }
}

hr {
  margin: 4px 10px;
  background: #8080802e;
  height: 1px;
  box-shadow: none;
  border: none;
}

.item-info {
  padding: 10px 10px;
  display: flex;
  align-items: center;
  color: var(--text-color);
  cursor: default;
  img {
    height: 38px;
    width: 38px;
    border-radius: 4px;
  }
  .info {
    margin-left: 8px;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-all;
  }
  .subtitle {
    font-size: 12px;
    opacity: 0.68;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-all;
  }

  img {
    border-radius: 8px;
    height: 46px;
    width: 46px;
    margin-right: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    cursor: pointer;
  }

  img.hover {
    filter: drop-shadow(100 200 0 black);
  }
}
</style>
