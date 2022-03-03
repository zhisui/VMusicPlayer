<template>
  <div class="menu-container">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'DropdownMenu',
})
</script>

<style lang="scss" scoped>
.menu-container {
  position: absolute;
  top: 40px;
  left: -30px;
  display: inline-block;
  user-select: none;
  min-width: 120px;
  max-width: 240px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  box-sizing: border-box;
  padding: 6px;
  z-index: 100000;
}
</style>
