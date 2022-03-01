<template>
  <div class="track-list">
    <!--展示歌曲列表-->
    <div :style="listStyle">
      <TracksListItem
        v-for="(track, index) in tracks"
        :key="itemkey === 'id' ? track.id : `${track.id}${index}`"
        :track-prop="track"
        :is-highlight-playing-track="props.isHighlightPlayingTrack"
        :class="`item-${index}`"
        :liked-songs="storeUser.liked.songs"
        :right-clicked-track="rightClickedTrack"
        :item-type="props.itemType"
        @play-this-list="playThisList"
        @dblclick="playThisList(track.id || track.songId)"
        @click.right="openMenu($event, track, index)"
      />

      <ContextMenu ref="menu">
        <!-- 展示歌曲名，封面、歌手 -->
        <div v-show="itemType !== 'cloundDisk'" class="item-info">
          <img :src="getImageUrl(224)" />
          <div class="info">
            <h3 class="title">{{ rightClickedTrackComputed.name }}</h3>
            <p class="subtitle">{{ rightClickedTrackComputed.ar[0].name }}</p>
          </div>
        </div>
        <hr />

        <div class="item" @click="play">播放</div>

        <div class="item" @click="addToQueue">
          添加到队列
        </div>

        <div v-show="itemType !== 'cloudDisk'" class="item" @click="addTrackToPlaylist">
          添加到歌单
        </div>

        <div
          v-show="!isRightClickedTrackLiked && itemType !== 'cloudDisk'"
          class="item"
          @click="like"
        >
          添加到我喜欢的音乐
        </div>

        <div
          v-show="isRightClickedTrackLiked && itemType !== 'cloudDisk'"
          class="item"
          @click="like"
        >
          从喜欢的音乐中删除
        </div>

        <div
          v-if="props.extraContextMenuItem.includes('removeTrackFromQueue')"
          class="item"
          @click="removeTrackFromQueue"
        >
          从队列中删除
        </div>
        <!-- 从歌单中删除只有在音乐库的歌单Item里面才会出现 -->
        <div
          v-if="props.extraContextMenuItem.includes('removeTrackFromPlaylist')"
          class="item"
          @click="removeTrackFromPlaylist"
        >
          从歌单中删除
        </div>

        <div
          v-if="props.extraContextMenuItem.includes('removeTrackFromCloudDisk')"
          class="item"
          @click="removeTrackFromCloudDisk"
        >
          从云盘中删除
        </div>
      </ContextMenu>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineEmits, defineProps, reactive, ref, withDefaults } from 'vue'

import { addOrRemoveTrackFromPlaylist } from '../api/playlist'
import { cloudDiskTrackDelete } from '../api/user'
import { modalsStore } from '../store/modalsStore'
import { toastStore } from '../store/toastStore'
import { userDataStore } from '../store/userData'
import { resizeImage } from '../utils/filters'
import player from '../utils/Player'

import ContextMenu from '@/components/ContextMenu.vue'
import TracksListItem from '@/components/TracksListItem.vue'
import { isAccountLogin } from '@/utils/auth'
const storeToast = toastStore()
const storeModals = modalsStore()
const storeUser = userDataStore()
const rightClickedTrack = reactive({
  id: 0,
  name: '',
  ar: [{ name: '' }],
  al: { picUrl: '' },
})
const rightClickedTrackIndex = ref(-1)
const listStyle = ref({})
const menu = ref()

interface AlbumObject {
  artist: {
    name: string
  }
}

interface Props {
  tracks: any[]
  itemType: string
  dbclickTrackFunc?: string
  // eslint-disable-next-line vue/require-default-prop
  albumObject?: AlbumObject
  id?: number
  columnNumber?: number
  isHighlightPlayingTrack?: boolean
  itemkey?: string
  // extraContextMenuItem的可能值'removeTrackFromPlaylist' 'removeTrackFromQueue' 'removeTrackFromCloudDisk'
  extraContextMenuItem: string[]
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'trackList',
  dbclickTrackFunc: 'default',
  columnNumber: 4,
  isHighlightPlayingTrack: true,
  itemkey: 'id',
  id: 0,
})

if (props.itemType === 'tracklist') {
  listStyle.value = {
    display: 'grid',
    gap: '4px',
    gridTemplateColumns: `repeat(${props.columnNumber}, 1fr)`,
  }
}

const emits = defineEmits(['removeTrack'])

// 判断当前歌曲是否是喜欢列表中的歌曲
const isRightClickedTrackLiked = computed(() => {
  const store = userDataStore()
  return store.liked.songs.includes(rightClickedTrack?.id)
})

const rightClickedTrackComputed = computed(() => {
  return props.itemType === 'cloudDisk'
    ? {
      id: 0,
      name: '',
      ar: [{ name: '' }],
      al: { picUrl: '' },
    }
    : rightClickedTrack
})
const playThisListDefault = (trackID: number) => {
  switch (props.itemType) {
    case 'playlist':
      player.playPlaylistByID(props.id, trackID)
      break
    case 'album':
      player.playAlbumByID(props.id, trackID)
      break
    case 'tracklist': {
      const trackIDs = props.tracks.map((t) => t.id)
      player.replacePlaylist(trackIDs, props.id, 'artist', trackID)
      break
    }
  }
}
const playThisList = (trackID: number) => {
  switch (props.dbclickTrackFunc) {
    case 'default': {
      playThisListDefault(trackID)
      break
    }
    case 'none': {
      // do nothing
      break
    }
    case 'playTrackOnListByID': {
      player.playTrackOnListByID(trackID)
      break
    }
    case 'playPlaylistByID': {
      player.playPlaylistByID(props.id, trackID)
      break
    }
    case 'playAList': {
      const trackIDs = props.tracks.map((t) => t.id || t.songId)
      player.replacePlaylist(trackIDs, props.id, 'artist', trackID)
      break
    }
    case 'dailyTracks': {
      const trackIDs = props.tracks.map((t) => t.id)
      player.replacePlaylist(trackIDs, props.id, 'url', trackID)
      break
    }
    case 'playCloudDisk': {
      const trackIDs = props.tracks.map((t) => t.id || t.songId)
      player.replacePlaylist(trackIDs, props.id, 'cloudDisk', trackID)
      break
    }
  }
}

const openMenu = (e: MouseEvent, track: any, index = -1) => {
  rightClickedTrack.id = track.id
  rightClickedTrack.name = track.name
  rightClickedTrack.ar = track.ar
  rightClickedTrack.al = track.al
  rightClickedTrackIndex.value = index
  menu.value.openMenu(e)
}

const play = () => {
  player.addTrackToPlayNext(rightClickedTrack.id, true)
}
// 将歌曲添加到队列中实现在现有歌单中插队播放 ，在播放列表开启的模式下可用
const addToQueue = () => {
  player.addTrackToPlayNext(rightClickedTrack.id)
}

const addTrackToPlaylist = () => {
  if (!isAccountLogin()) {
    storeToast.showToast('此操作需要登录网易云账户')
  }
  storeModals.addTrackToPlaylistModal.show = true
  storeModals.addTrackToPlaylistModal.selectedTrackID = rightClickedTrack.id
}

const removeTrackFromPlaylist = () => {
  if (!isAccountLogin()) {
    storeToast.showToast('此操作需要登录网易云账户')
    return
  }
  // eslint-disable-next-line no-restricted-globals
  if (confirm(`确定要从歌单删除 ${rightClickedTrack.name}？`)) {
    const trackID = rightClickedTrack.id.toString()
    addOrRemoveTrackFromPlaylist({
      op: 'del',
      pid: props.id.toString(),
      tracks: trackID,
    }).then((data) => {
      storeToast.showToast(data.body.code === 200 ? '已从歌单中删除' : data.body.message)
      emits('removeTrack', trackID)
    })
  }
}

const removeTrackFromQueue = () => {
  player.removeTrackFromQueue(rightClickedTrackIndex.value)
}

const removeTrackFromCloudDisk = () => {
  // 注意调用接口返回的云盘信息在simpleSongs字段里面
  // eslint-disable-next-line no-restricted-globals
  if (confirm(`确定要从云盘删除 ${rightClickedTrack.name}？`)) {
    const trackID = rightClickedTrack.id.toString()
    cloudDiskTrackDelete({ id: trackID }).then((data) => {
      storeToast.showToast(data.code === 200 ? '已将此歌曲从云盘删除' : data.message)
      const newCloudDisk = storeUser.liked.cloudDisk.filter((t: any) => t.id !== trackID)
      storeUser.liked.cloudDisk = newCloudDisk
    })
  }
}

const like = () => {
  storeUser.loveATrck(rightClickedTrack.id)
}

const getImageUrl = (size: number) => {
  const initialUrl = rightClickedTrackComputed.value.al.picUrl
  return resizeImage(initialUrl, size)
}
</script>
<style lang="scss" scoped>
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
</style>
