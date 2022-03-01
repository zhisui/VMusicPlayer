<template>
  <div v-show="show" class="container">
    <h1>
      <img :src="store.user.avatarUrl" />
      {{ store.user.nickname }}的音乐库
    </h1>
    <div id="part1">
      <div class="musiclist">
        <div class="mylike" @click="tolikeSongsList">
          <div class="top">
            <p
              v-for="(line, index) in pickedLyric"
              v-show="line !== ''"
              :key="line + index"
            >
              {{ line }}
            </p>
          </div>
          <div class="bottom">
            <div>
              <h2>我喜欢的音乐</h2>
              <p>{{ store.liked.songs.length }}首歌</p>
            </div>
            <button @click.stop="openPlayModeTabMenu">
              <Icon
                id="icon"
                icon="ci:play-arrow"
                color="white"
                height="40"
                :vertical-flip="true"
              />
            </button>
          </div>
        </div>

        <div class="songs">
          <TracksList
            :id="store.liked.playlists.length > 0 ? store.liked.playlists[0].id : 0"
            :tracks="store.liked.songsWithDetails"
            :column-number="3"
            item-type="tracklist"
            dbclick-track-func="playPlaylistByID"
          />
        </div>
      </div>
    </div>

    <div id="part2">
      <div class="tabs-row">
        <div class="tabs">
          <div
            class="tab dropdown"
            :class="{ active: currentTab === 'playlists' }"
            @click="updateCurrentTab('playlists')"
          >
            <span class="text">{{ playlistFilter() }}</span>
            <span class="icon" @click.stop="openPlaylistTabMenu">
              <Icon icon="ic:baseline-arrow-drop-down" />
            </span>
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'albums' }"
            @click="updateCurrentTab('albums')"
          >
            专辑
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'artists' }"
            @click="updateCurrentTab('artists')"
          >
            歌手
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'mvs' }"
            @click="updateCurrentTab('mvs')"
          >
            MV
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'cloudDisk' }"
            @click="updateCurrentTab('cloudDisk')"
          >
            云盘
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'playHistory' }"
            @click="updateCurrentTab('playHistory')"
          >
            听歌排行
          </div>
        </div>

        <button
          v-show="currentTab === 'playlists'"
          class="tab-button"
          @click="openAddPlaylistModal"
        >
          <Icon icon="ant-design:plus-outlined" />新建歌单
        </button>

        <button
          v-show="currentTab === 'cloudDisk'"
          class="tab-button"
          @click="selectUploadFiles"
        >
          <Icon icon="akar-icons:arrow-up" /> 上传歌曲
        </button>
      </div>

      <!-- 展示每个tab对应的内容 -->
      <div v-show="currentTab === 'playlists'">
        <div v-if="store.liked.playlists.length > 1">
          <CoverRow
            :items="filterPlaylists().slice(1)"
            type="playlist"
            sub-text="creator"
            :show-play-button="true"
          />
        </div>
      </div>

      <div v-show="currentTab === 'albums'">
        <CoverRow
          :items="store.liked.albums"
          type="album"
          sub-text="artist"
          :show-play-button="true"
        />
      </div>

      <div v-show="currentTab === 'artists'">
        <CoverRow :items="store.liked.artists" type="artist" :show-play-button="true" />
      </div>

      <div v-show="currentTab === 'mvs'">
        <MvRow :mvs="store.liked.mvs" />
      </div>

      <div v-show="currentTab === 'cloudDisk'">
        <TracksList
          :id="-8"
          :tracks="store.liked.cloudDisk"
          :column-number="3"
          item-type="cloudDisk"
          dbclick-track-func="playCloudDisk"
          :extra-context-menu-item="['removeTrackFromCloudDisk']"
        />
      </div>

      <div v-show="currentTab === 'playHistory'">
        <button
          class="playHistory-button"
          :class="{ active: playHistoryMode === 'week' }"
          @click="playHistoryMode = 'week'"
        >
          最近一周
        </button>

        <button
          class="playHistory-button"
          :class="{ active: playHistoryMode === 'all' }"
          @click="playHistoryMode = 'all'"
        >
          所有時間
        </button>
        <TracksList
          :tracks="playHistoryTracks()"
          :column-number="1"
          item-type="tracklist"
        />
      </div>
    </div>

    <input
      ref="cloudDiskUploadInput"
      type="file"
      style="display: none;"
      @change="uploadSongToCloudDisk()"
    />

    <ContextMenu ref="playlistTabMenu">
      <div class="item" @click="changePlaylistFilter('全部歌单')">
        全部歌单
      </div>
      <hr />
      <div class="item" @click="changePlaylistFilter('创建的歌单')">
        创建的歌单
      </div>
      <div class="item" @click="changePlaylistFilter('收藏的歌单')">
        收藏的歌单
      </div>
    </ContextMenu>

    <ContextMenu ref="playModeTabMenu">
      <div class="item" @click="playLikedSongs">
        喜欢的音乐
      </div>
      <hr />
      <div class="item">心动模式</div>
    </ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import NProgress from 'nprogress'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { uploadSong } from '../api/user'
import { modalsStore } from '../store/modalsStore'
import { toastStore } from '../store/toastStore'
import { isAccountLogin } from '../utils/auth'
import player from '../utils/Player'

import { getLyric } from '@/api/track'
import ContextMenu from '@/components/ContextMenu.vue'
import CoverRow from '@/components/CoverRow.vue'
import MvRow from '@/components/MvRow.vue'
import TracksList from '@/components/TracksList.vue'
import { userDataStore } from '@/store/userData'
import { randomNum } from '@/utils/common'

const store = userDataStore()
const storeToast = toastStore()
const router = useRouter()
const currentTab = ref('playlists')
const show = ref<boolean>(false)
const playHistoryMode = ref('week')
const playlistTabMenu = ref()
const playModeTabMenu = ref()
const cloudDiskUploadInput = ref()

const lyric = ref<string>('')
onMounted(async () => {
  store.fetchLikedPlaylist()
  store.fetchLikedSongsWithDetails()
  store.fetchLikedArtists()
  store.fetchLikedMVs()
  store.fetchCloudDisk()
  store.fetchPlayHistory()
  store.fetchLikedAlbums()
  await store.fetchLikedSongsIDs()
  getRandomLyric()
  NProgress.done()
  show.value = true
})
console.log(store)

const playLikedSongs = () => {
  player.playPlaylistByID(store.liked.playlists[0].id, '0', true)
}

// const playIntelligenceList = () => {
//   player.playIntelligenceListById(this.liked.playlists[0].id, 'first', true)
// }
const extractLyricPart = (rawLyric: string) => {
  return rawLyric.split(']')[1].trim()
}
const pickedLyric = computed(() => {
  if (!lyric.value) return []
  const lyricLine = lyric.value
    .split('\n')
    .filter((line) => !line.includes('作词') && !line.includes('作曲'))
  // 最多显示3行歌词
  const lyricsToPick = Math.min(lyricLine.length, 3)
  const randomUpperBound = lyricLine.length - lyricsToPick
  const stratLyricLineIndex = randomNum(0, randomUpperBound - 1)
  // 将选中的3行以下歌词显示出来
  const lyrics = lyricLine
    .slice(stratLyricLineIndex, stratLyricLineIndex + lyricsToPick)
    .map(extractLyricPart)
  return lyrics
})

const getRandomLyric = async () => {
  const likedSongsIds = store.liked.songs
  if (likedSongsIds.length === 0) return
  await getLyric(likedSongsIds[randomNum(0, likedSongsIds.length)]).then((res) => {
    if (res.lrc !== undefined) {
      const isInstrumental = res.lrc.lyric
        .split('\n')
        .filter((l: string) => l.includes('做词'))
      lyric.value =
        isInstrumental.length === 0
          ? res.lrc.lyric
          : '[00:40.52]刻骨的变迁不是遥远\n[00:46.94]再有一万年深情也不变\n[00:54.36]爱像烈火般蔓延\n'
    }
  })
}

// 路由部分
const tolikeSongsList = () => {
  router.push({ name: 'likedSongs' })
}

const updateCurrentTab = (tab: string) => {
  if (!isAccountLogin() && tab !== 'playlists') {
    storeToast.showToast('此操作需登录网易云音乐')
    return
  }
  currentTab.value = tab
  window.scrollTo({ top: 375, behavior: 'smooth' })
}

const changePlaylistFilter = (type: string) => {
  store.libraryPlaylistFilter = type
  window.scrollTo({ top: 375, behavior: 'smooth' })
}
const playlistFilter = () => {
  return store.libraryPlaylistFilter
}
const openPlaylistTabMenu = (e: MouseEvent) => {
  playlistTabMenu.value.openMenu(e)
}
const filterPlaylists = () => {
  const playlists = store.liked.playlists
  const userId = store.user.userId
  if (playlistFilter() === '创建的歌单') {
    return playlists.filter((p: any) => p.creator.userId === userId)
  } else if (playlistFilter() === '收藏的歌单') {
    return playlists.filter((p: any) => p.creator.userId !== userId)
  }
  return playlists
}

const openAddPlaylistModal = () => {
  if (!isAccountLogin()) {
    storeToast.showToast('此操作需登录网易云音乐')
    return
  }
  const storeModals = modalsStore()
  storeModals.newPlaylistModal.show = true
}

// eslint-disable-next-line vue/return-in-computed-property
const playHistoryTracks = () => {
  if (playHistoryMode.value === 'week') {
    return store.liked.playHistory.weekData
  }

  if (playHistoryMode.value === 'all') {
    return store.liked.playHistory.allData
  }
}

const selectUploadFiles = () => {
  cloudDiskUploadInput.value.click()
}
const uploadSongToCloudDisk = (e: MouseEvent) => {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    uploadSong(files[0]).then((result) => {
      if (result.code === 200) {
        const newCloudDisk = store.liked.cloudDisk
        newCloudDisk.unshift(result.privateCloud)
        store.liked.cloudDisk = newCloudDisk
      }
    })
  }
}

const openPlayModeTabMenu = (e: MouseEvent) => {
  playModeTabMenu.value.openMenu(e)
}
</script>

<style lang="scss" scoped>
.container {
  padding-right: 10vw;
  padding-left: 10vw;
}

h1 {
  font-size: 40px;
  color: var(--text-color);
  text-align: left;
  img {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    vertical-align: -6px;
  }
}
#part1 {
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  margin-bottom: 30px;
}

.musiclist {
  display: flex;
  justify-content: space-between;

  .mylike {
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    box-sizing: border-box;
    background-color: var(--primary-bg-color);
    .top {
      margin-bottom: 50px;
      p {
        font-size: 14px;
        margin-bottom: -10px;
        color: var(--primary-color);
      }
    }
    .bottom {
      display: flex;
      margin-top: 27px;
      justify-content: space-around;
      color: var(--primary-color);
    }
    .bottom p {
      margin: {
        top: -15px;
        bottom: -1px;
      }
    }
    .bottom button {
      display: flex; //增加这个属性使得播放图标居中
      align-items: center;
      height: 44px;
      width: 44px;
      background-color: var(--primary-color);
      border-radius: 50%;
      transition: 0.2s;
      margin: {
        top: 30px;
        left: 60px;
      }
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.4);
      }
      &:active {
        transform: scale(0.9);
      }
    }
  }

  .songs {
    flex: 7;
    margin-top: 8px;
    margin-left: 36px;
    overflow: hidden;
  }
}

.part2 {
  margin-top: 54px;
  min-height: calc(100vh - 182px);
}

.tabs-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  font-size: 18px;
  color: var(--text-color);
  .tab {
    font-weight: 600;
    padding: 8px 14px;
    margin-right: 14px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: 0.2s;
    opacity: 0.68;
    &:hover {
      opacity: 0.88;
      background-color: var(--secondary-bg-color);
    }
  }
  .tab.active {
    opacity: 0.88;
    background-color: var(--secondary-bg-color);
  }
  .tab.dropdown {
    display: flex;
    align-items: center;
    padding: 0;
    overflow: hidden;
    .text {
      padding: 8px 3px 8px 14px;
    }
    .icon {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 8px 0 3px;
      .svg-icon {
        height: 16px;
        width: 16px;
      }
    }
  }
}

button.tab-button {
  color: var(--color-text);
  border-radius: 8px;
  padding: 0 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  opacity: 0.68;
  font-weight: 500;
  &:hover {
    opacity: 1;
    background: var(--secondary-bg-color);
  }
  &:active {
    opacity: 1;
    transform: scale(0.92);
  }
}

button.playHistory-button {
  color: var(--text-color);
  border-radius: 8px;
  padding: 10px;
  margin-left: 10px;
  transition: 0.2s;
  opacity: 0.68;
  font-weight: 500;
  &:hover {
    opacity: 1;
    background: var(--secondary-bg-color);
  }
}
button.playHistory-button.active {
  color: var(--primary-color);
  background: var(--secondary-bg-color);
}
</style>
