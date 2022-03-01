<template>
  <div class="fm" :style="{ background }" data-theme="dark">
    <img :src="nextTrackCover" style="display: none;" />
    <img class="cover" :src="albumPicUrl()" @click="goToAlbum" />
    <div class="right-part">
      <div class="info">
        <div class="title">{{ track.name }}</div>
        <div class="artist"><ArtistsInLine :artists="artists" /></div>
      </div>
      <div class="controls">
        <div class="buttons">
          <IconButton title="不喜欢" @click="moveToFMTrash">
            <Icon id="thumbs-down" icon="carbon:thumbs-down" />
          </IconButton>

          <IconButton :title="isPlaying ? '暂停' : '播放'" class="play" @click="play">
            <Icon v-show="isPlaying === false" icon="bi:play-fill" />
            <Icon v-show="isPlaying === true" icon="carbon:pause-filled" />
          </IconButton>

          <IconButton title="下一首" @click="next">
            <Icon icon="fluent:next-32-filled" />
          </IconButton>
        </div>
        <div class="card-name"><svg-icon icon-class="fm" />私人FM</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import Color from 'color'
import Vibrant from 'node-vibrant'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { playerStore } from '../store/playerStore'
import { resizeImage } from '../utils/filters'
import player from '../utils/Player'

import ArtistsInLine from '@/components/ArtistsInLine.vue'
import IconButton from '@/components/IconButton.vue'

const background = ref('')
const storePlayer = playerStore()
const router = useRouter()

const track = computed(() => {
  console.log(storePlayer.personalFMTrack)

  return storePlayer.personalFMTrack
})
const isPlaying = computed(() => {
  return storePlayer.playing && storePlayer.isPersonalFM
})
const artists = computed(() => {
  return track.value.artists || track.value.ar || []
})
const nextTrackCover = computed(() => {
  return `${storePlayer.personalFMNextTrack?.album?.picUrl.replace(
    'http://',
    'https://'
  )}?param=512y512`
})

const getColor = () => {
  if (!storePlayer.personalFMTrack?.album?.picUrl) return
  const cover = `${storePlayer.personalFMTrack.album.picUrl.replace(
    'http://',
    'https://'
  )}?param=512y512`
  Vibrant.from(cover)
    .getPalette()
    .then((palette) => {
      if (palette.Vibrant) {
        const color = Color.rgb(palette.Vibrant._rgb).darken(0.1).rgb().string()
        const color2 = Color.rgb(palette.Vibrant._rgb)
          .lighten(0.28)
          .rotate(-30)
          .rgb()
          .string()
        background.value = `linear-gradient(to top left, ${color}, ${color2})`
      }
    })
}

getColor()

const play = () => {
  player.playPersonalFM()
}
const next = () => {
  player.playNextFMTrack().then((result) => {
    if (result) {
      getColor()
    }
  })
}
const goToAlbum = () => {
  if (track.value.album.id === 0) return
  router.push({ path: '/album/' + track.value.album.id })
}
const moveToFMTrash = () => {
  player.moveToFMTrash()
  getColor()
}
const albumPicUrl = () => {
  return resizeImage(track.value.album.picUrl)
}
player._init()
</script>

<style lang="scss">
.fm {
  padding: 1rem;
  background: var(--color-secondary-bg);
  border-radius: 1rem;
  display: flex;
  height: 198px;
  box-sizing: border-box;
}
.cover {
  height: 100%;
  clip-path: border-box;
  border-radius: 0.75rem;
  margin-right: 1.2rem;
  cursor: pointer;
  user-select: none;
}
.right-part {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text);
  width: 100%;
  .title {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .artist {
    opacity: 0.68;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-left: -0.4rem;
    .buttons {
      display: flex;
    }
    .button-icon {
      margin: 0 8px 0 0;
    }
    .svg-icon {
      width: 24px;
      height: 24px;
    }
    .svg-icon#thumbs-down {
      width: 22px;
      height: 22px;
    }
    .card-name {
      font-size: 1rem;
      opacity: 0.18;
      display: flex;
      align-items: center;
      font-weight: 600;
      user-select: none;
      .svg-icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
    }
  }
}
</style>
