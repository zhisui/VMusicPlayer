<template>
  <div class="player" @click="toggleLyrics">
    <div
      class="progress-bar"
      :class="{
        'nyancat': storeSetting.nyancatStyle,
        'nyancat-stop': storeSetting.nyancatStyle && !storePlayer.playing,
      }"
      @click.stop
    >
      <!-- <vue3-slider value="20" color="red" track-color="blue" height="2px" /> -->
      <!-- <vue-slider
        v-model="player.progress"
        :min="0"
        :max="player.currentTrackDuration"
        :interval="1"
        :drag-on-click="true"
        :duration="0"
        :dot-size="12"
        :height="2"
        :tooltip-formatter="formatTrackTime"
        :lazy="true"
        :silent="true"
      ></vue-slider> -->
    </div>

    <div class="controls">
      <div class="playing">
        <div class="container" @click.stop>
          <!-- 封面及歌曲信息 -->
          <img :src="resizeImage(currentTrack.al.picUrl, 224)" @click="goToAlbum" />

          <div class="track-info" :title="audioSource">
            <div
              :class="['name', { 'has-list': hasList() }]"
              @click="hasList() && goToList()"
            >
              {{ currentTrack.name }}
            </div>
            <div class="artist">
              <span
                v-for="(ar, index) in currentTrack.ar"
                :key="ar.id"
                @click="ar.id && goToArtist(ar.id)"
              >
                <span :class="{ ar: ar.id }">
                  {{ ar.name }}
                </span>
                <span v-if="index !== currentTrack.ar.length - 1">, </span>
              </span>
            </div>
          </div>

          <!-- 喜欢按钮 -->
          <div class="like-button">
            <button @click="storeUser.likeATrack(storePlayer.currentTrack.id)">
              <!-- <Icon
                v-show="player.isCurrentTrackLiked"
                icon="ant-design:heart-outlined"
                title="喜欢"
              /> -->
              <!-- <Icon
                v-show="!player.isCurrentTrackLiked"
                title="取消喜欢"
                icon="ant-design:heart-filled"
              /> -->
            </button>
          </div>
        </div>
        <div class="blank"></div>
      </div>

      <!-- 中间按钮 -->
      <div class="middle-control-buttons">
        <div class="blank"></div>
        <div class="container" @click.stop>
          <button v-show="!storePlayer.isPersonalFM" title="上一首">
            <Icon icon="fluent:previous-24-filled" />
          </button>
          <button v-show="storePlayer.isPersonalFM" title="不喜欢">
            <Icon icon="bi:hand-thumbs-down" />
          </button>

          <button class="play" :title="(playing ? '暂停' : '播放')">
            <Icon v-show="!playing === true" icon="bi:play-fill" />
            <Icon v-show="playing === true" icon="fa6-solid:pause" />
          </button>

          <button title="下一首" @click="playNextTrack">
            <Icon icon="fluent:next-24-filled" />
          </button>
        </div>
        <div class="blank"></div>
      </div>

      <!-- 右边 按钮-->
      <div class="right-control-buttons">
        <div class="blank"></div>
        <div class="container" @click.stop>
          <button
            title="播放列表"
            :class="{
              active: route.name === 'next',
              disabled: storePlayer.isPersonalFM,
            }"
            @click="goToNextTracksPage"
          >
            <Icon icon="bi:music-note-list" />
          </button>

          <button
            :class="{
              active: storePlayer.repeatMode !== 'off',
              disabled: storePlayer.isPersonalFM,
            }"
            :title="storePlayer.repeatMode === 'one' ? '单曲循环' : '循环播放'"
          >
            <Icon v-show="storePlayer.repeatMode !== 'one'" icon="cil:loop" />
            <Icon v-show="storePlayer.repeatMode === 'one'" icon="cil:loop-1" />
          </button>

          <button
            :class="{ active: storePlayer.shuffle, disabled: storePlayer.isPersonalFM }"
            title="随机播放"
          >
            <Icon icon="jam:shuffle" />
          </button>
          <!-- 这地方没懂是显示的什么 -->
          <!-- <button
            v-if="storeSetting.enableReversedMode"
            :class="{ active: player.reversed, disabled: player.isPersonalFM }"
            :title="$t('player.reversed')"
            @click="player.switchReversed"
          >
            <svg-icon icon-class="sort-up" />
          </button> -->
          <div class="volume-control">
            <button title="静音">
              <Icon v-show="volume > 0.5" icon="bxs:volume-full" />
              <Icon v-show="volume === 0" icon="clarity:volume-mute-solid" />
              <Icon v-show="volume <= 0.5 && volume !== 0" icon="bxs:volume-low" />
            </button>
            <!-- <div class="volume-bar">
              <vue-slider
                v-model="volume"
                :min="0"
                :max="1"
                :interval="0.01"
                :drag-on-click="true"
                :duration="0"
                tooltip="none"
                :dot-size="12"
              ></vue-slider>
            </div> -->
          </div>

          <button
            class="lyrics-button"
            title="歌词"
            style="margin-left: 12px;"
            @click="toggleLyrics"
          >
            <Icon icon="dashicons:arrow-up-alt2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// import VueSlider from 'vue-slider-component'
// import slider from 'vue3-slider'
import '@/assets/css/slider.css'

import { playerStore } from '../store/playerStore'
import { settingStore } from '../store/settingStore'
import { userDataStore } from '../store/userData'
import { resizeImage } from '../utils/filters'
import player from '../utils/Player'

import { lyricsStore } from '@/store/lyricsStore'
import { goToListSource, hasListSource } from '@/utils/playList'
const storeSetting = settingStore()
const storePlayer = playerStore()
const storeUser = userDataStore()
const storeLyrics = lyricsStore()
const route = useRoute()
const router = useRouter()
const currentTrack = computed(() => {
  return storePlayer.currentTrack
})
const volume = computed({
  get: () => {
    return storePlayer.volume
  },
  set: (value) => {
    return (storePlayer.volume = value)
  },
})

const playing = computed(() => {
  return storePlayer.playing
})
const audioSource = computed(() => {
  // 这地方有点问题
  return storePlayer.howler?.src.includes('kuwo.cn') ? '音源来自酷我音乐' : ''
})

// ...mapMutations(['toggleLyrics']),
// ...mapActions(['showToast', 'likeATrack']),
const playNextTrack = () => {
  if (storePlayer.isPersonalFM) {
    player.playNextFMTrack()
  } else {
    player.playNextTrack()
  }
}
const toggleLyrics = () => {
  storeLyrics.showLyrics = !storeLyrics.showLyrics
}

const goToNextTracksPage = () => {
  if (storePlayer.isPersonalFM) return
  // eslint-disable-next-line no-unused-expressions
  route.name === 'next' ? router.go(-1) : router.push({ name: 'next' })
}

// const formatTrackTime = (value: number) => {
//   if (!value) return ''
//   const min = ~~((value / 60) % 60)
//   const sec = (~~(value % 60)).toString().padStart(2, '0')
//   return `${min}:${sec}`
// }
const hasList = () => {
  return hasListSource()
}
const goToList = () => {
  goToListSource()
}
const goToAlbum = () => {
  if (storePlayer.currentTrack.al.id === 0) return
  router.push({ path: '/album/' + storePlayer.currentTrack.al.id })
}
const goToArtist = (id: number) => {
  router.push({ path: '/artist/' + id })
}
</script>

<style lang="scss" scoped>
.player {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 64px;
  backdrop-filter: saturate(180%) blur(30px);
  // background-color: rgba(255, 255, 255, 0.86);
  background-color: var(--color-navbar-bg);
  z-index: 100;
}

@supports (-moz-appearance: none) {
  .player {
    background-color: var(--color-body-bg);
  }
}

.progress-bar {
  margin-top: -6px;
  margin-bottom: -6px;
  width: 100%;
}

.controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 100%;
  padding: {
    right: 10vw;
    left: 10vw;
  }
}

@media (max-width: 1336px) {
  .controls {
    padding: 0 5vw;
  }
}

.blank {
  flex-grow: 1;
}

.playing {
  display: flex;
}

.playing .container {
  display: flex;
  align-items: center;
  img {
    height: 46px;
    border-radius: 5px;
    box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.16);
    cursor: pointer;
    user-select: none;
  }
  .track-info {
    height: 46px;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .name {
      font-weight: 600;
      font-size: 16px;
      opacity: 0.88;
      color: var(--color-text);
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
    }
    .has-list {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
    .artist {
      font-size: 12px;
      opacity: 0.58;
      color: var(--color-text);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      span.ar {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.middle-control-buttons {
  display: flex;
}

.middle-control-buttons .container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  .button-icon {
    margin: 0 8px;
  }
  .play {
    height: 42px;
    width: 42px;
    .svg-icon {
      width: 24px;
      height: 24px;
    }
  }
}

.right-control-buttons {
  display: flex;
}

.right-control-buttons .container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .expand {
    margin-left: 24px;
    .svg-icon {
      height: 24px;
      width: 24px;
    }
  }
  .active .svg-icon {
    color: var(--color-primary);
  }
  .volume-control {
    margin-left: 4px;
    display: flex;
    align-items: center;
    .volume-bar {
      width: 84px;
    }
  }
}

.like-button {
  margin-left: 16px;
}

.button-icon.disabled {
  cursor: default;
  opacity: 0.38;
  &:hover {
    background: none;
  }
  &:active {
    transform: unset;
  }
}
</style>
