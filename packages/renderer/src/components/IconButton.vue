<template>
  <button class="button-icon"><slot></slot></button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'IconButton',
})
</script>

<style lang="scss">
button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background-color: transparent;
  border-radius: 3px;
  transition: 0.2s;
}
.button-icon {
  &:hover {
    background-color: var(--btn-hover-color);
  }
  &:active {
    transform: scale(0.92);
  }
}
</style>
