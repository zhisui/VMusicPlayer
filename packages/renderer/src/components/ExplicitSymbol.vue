<template>
  <Icon icon="ic:baseline-explicit" :style="svgStyle" />
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { defineProps, ref, withDefaults } from 'vue'
const svgStyle = ref({})

interface Props {
  size: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
})
svgStyle.value = {
  height: props.size + 'px',
  width: props.size + 'px',
}
</script>

<style lang="scss"></style>
