<template>
  <div
    class="track"
    :class="trackClass"
    :style="trackStyle"
    :title="showUnavailableSongInGreyStyle ? track.reason : ''"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <!-- 显示歌曲对应图片 在专辑中不会显示-->
    <img v-if="!isAlbum" :src="imgUrl" :class="{ hover: focus }" @click="goToAlbumDetail" />

    <!-- 专辑列表会显示这部分内容-->
    <div v-if="showOrderNumber" class="no">
      <button v-show="focus && playable && !isPlaying" @click="playTrack">
        <Icon icon="bi:play-fill" class="icon" />
      </button>
      <span v-show="(!focus || !playable) && !isPlaying">{{ track.no }}</span>
      <button v-show="isPlaying">
        <Icon icon="clarity:volume-up-solid" class="icon" />
      </button>
    </div>

    <!-- 显示歌曲名和歌手 -->
    <div class="title-and-artist">
      <div class="container">
        <!-- 显示歌曲名称 -->
        <div class="title">
          {{ track.name }}
          <span v-if="isAlbum" class="featured">
            <ArtistsInLine :artists="track.ar" prefix="-" />
          </span>
          <span v-if="isAlbum && track.mark === 1318912" class="explicit-symbol">
            <ExplicitSymbol />
          </span>
          <!-- 歌曲括号部分-->
          <span v-if="isSubTitle" :title="subTitle" class="sub-title">
            ({{ subTitle }})
          </span>
        </div>
        <!-- 显示歌手 -->
        <div v-if="!isAlbum" class="artist">
          <span v-if="track.mark === 1318912" class="explicit-symbol before-artist">
            <ExplicitSymbol :size="15" />
          </span>
          <ArtistsInLine :artists="artists" />
        </div>
      </div>
      <div></div>
    </div>

    <!-- 显示音乐名称 -->
    <div v-if="showAlbumName" class="album">
      <router-link v-if="album && album.id" :to="`/album/${album.id}`">
        {{ album.name }}
      </router-link>
      <div></div>
    </div>

    <!-- 显示喜欢爱心 -->
    <div v-if="showLikeButton" class="actions">
      <button @click="likeThisSong">
        <Icon
          icon="ci:heart-outline"
          icon-class="heart"
          :style="{
            visibility: focus && !isLiked ? 'visible' : 'hidden',
          }"
          class="icon"
        />
        <Icon v-show="isLiked" icon="ci:heart-fill" color="red" class="icon" />
      </button>
    </div>

    <!-- 显示歌曲总时长 -->
    <div v-if="showTrackTime" class="time">
      {{ track.dt }}
    </div>

    <!-- 显示歌曲播放次数 -->
    <div v-if="track.playCount" class="count">
      {{ track.playCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { isNil } from 'lodash'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import ArtistsInLine from '@/components/ArtistsInLine.vue'
import ExplicitSymbol from '@/components/ExplicitSymbol.vue'
import { playerStore } from '@/store/playerStore'
import { settingStore } from '@/store/settingStore'
const hover = ref(false)
const trackStyle = ref({})
const settingState = settingStore()
const playerState = playerStore()
const router = useRouter()
interface TrackProp {
  [x: string]: any
  TrackProp: {
    privilege: {}
    playable: boolean
  }
}

interface Props {
  trackProp: TrackProp
  isHighlightPlayingTrack: boolean
  itemType: string
  likedSongs: number[]
  rightClickedTrack?: any
}

// eslint-disable-next-line no-undef
const emits = defineEmits(['playThisList', 'likeATrack'])
// eslint-disable-next-line no-undef
const props = withDefaults(defineProps<Props>(), {
  isHighlightPlayingTrack: true,
})

const track = computed(() => {
  return props.trackProp
})

const showUnavailableSongInGreyStyle = computed(() => {
  // eslint-disable-next-line no-undef
  return process.env.IS_ELECTRON ? !settingState.enableUnblockNeteaseMusic : true
})

const playable = computed(() => {
  return track.value.privilege?.pl > 0 || track.value.playable
})
const isPlaying = computed(() => {
  return playerState.currentTrack.id === track.value.id
})
const isMenuOpened = computed(() => {
  return props.rightClickedTrack.id === track.value.id
})
const focus = computed(() => {
  return (hover.value && props.rightClickedTrack.id === 0) || isMenuOpened.value
})

const trackClass = computed(() => {
  const trackClass = [props.itemType]
  if (!playable.value && showUnavailableSongInGreyStyle.value) {
    trackClass.push('disable')
  }
  if (isPlaying.value && props.isHighlightPlayingTrack) {
    trackClass.push('playing')
  }
  if (focus.value) {
    trackClass.push('focus')
  }
  return trackClass
})

const isAlbum = computed(() => {
  return props.itemType === 'album'
})

const imgUrl = computed(() => {
  const image =
    track.value?.al?.picUrl ??
    track.value?.album?.picUrl ??
    'https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
  return image + '?param=224y224'
})

const goToAlbumDetail = () => {
  router.push({ path: '/album/' + track.value.al.id })
}

const showOrderNumber = isAlbum.value
const playTrack = () => {
  emits('playThisList', track.value.id)
}
const likeThisSong = () => {
  emits('likeATrack', track.value.id)
}

const isSubTitle = computed(() => {
  return (
    (track.value?.tns?.length > 0 && track.value.name !== track.value.tns[0]) ||
    track.value.alia?.length > 0
  )
})

const subTitle = computed(() => {
  let tn = ''
  if (track.value?.tns?.length > 0 && track.value.name !== track.value.tns[0]) {
    tn = track.value.tns[0]
  }
  // 优先显示alia里面的内容
  if (settingState.subTitleDefault) {
    return track.value?.alia?.length > 0 ? track.value.alia : tn
  }
  return tn === undefined ? track.value.alia[0] : tn
})

const artists = computed(() => {
  const { ar, artist } = track.value
  if (!isNil(ar)) return ar
  if (!isNil(artist)) return artist
  return []
})

const showAlbumName = computed(() => {
  return props.itemType !== 'album' && props.itemType !== 'tracklist'
})

const showLikeButton = computed(() => {
  return props.itemType !== 'tracklist' && props.itemType !== 'cloudDisk'
})

const showTrackTime = computed(() => {
  return props.itemType !== 'tracklists'
})

const album = computed(() => {
  return track.value.al || track.value.album || track.value?.simpleSong?.al
})

const isLiked = computed(() => {
  return props.likedSongs?.includes(track.value.id)
})
</script>

<style lang="scss" scoped>
button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: transparent;
  border-radius: 25%;
  transition: transform 0.2s;
  .icon {
    height: 16px;
    width: 16px;
    color: var(--primary-color);
  }
  &:hover {
    transform: scale(1.12);
  }
  &:active {
    transform: scale(0.96);
  }
}

.track {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 12px;
  user-select: none;

  .no {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    margin: 0 20px 0 10px;
    width: 12px;
    color: var(--color-text);
    cursor: default;
    span {
      opacity: 0.58;
    }
  }

  .explicit-symbol {
    opacity: 0.28;
    color: var(--text-color);
    .icon {
      margin-bottom: -3px;
    }
  }

  .explicit-symbol.before-artist {
    margin-right: 2px;
    .icon {
      margin-bottom: -3px;
    }
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

  .title-and-artist {
    flex: 1;
    display: flex;
    .container {
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
      cursor: default;
      padding-right: 16px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      .featured {
        margin-right: 2px;
        font-weight: 500;
        font-size: 14px;
        opacity: 0.72;
      }
      .sub-title {
        color: #aeaeae;
        margin-left: 4px;
      }
    }
    .artist {
      margin-top: 2px;
      font-size: 13px;
      opacity: 0.68;
      color: var(--text-color);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      a {
        span {
          margin-right: 3px;
          opacity: 0.8;
        }
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }
  }
  .album {
    flex: 1;
    display: flex;
    font-size: 16px;
    opacity: 0.88;
    color: var(--text-color);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .time,
  .count {
    font-size: 16px;
    width: 50px;
    cursor: default;
    display: flex;
    justify-content: flex-end;
    margin-right: 10px;
    font-variant-numeric: tabular-nums;
    opacity: 0.88;
    color: var(--text-color);
  }
}
</style>
