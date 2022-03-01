<template>
  <span class="artist-in-line">
    {{ computedPrefix }}
    <span v-for="(ar, index) in filteredArtists" :key="index">
      <router-link v-if="ar.id !== 0" :to="`/artist/${ar.id}`">
        {{ ar.name }}
      </router-link>
      <span v-else>{{ ar.name }}</span>
      <span v-if="index !== filteredArtists.length - 1">,</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue'
type Artists = { name: string; id: number }[]
interface Props {
  artists: Artists
  exclude?: string
  prefix?: string
}
const props = withDefaults(defineProps<Props>(), {
  exclude: '',
  prefix: '',
})

const filteredArtists = computed(() => {
  return props.artists
  // return props.artists.filter((a) => a.name !== props.exclude)
})
const computedPrefix = computed(() => {
  return filteredArtists.value.length !== 0 ? props.prefix : ''
})
</script>

<style lang="ts"></style>
