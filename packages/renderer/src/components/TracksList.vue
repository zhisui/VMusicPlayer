<template>
  <div class="track-list">
    <!--展示歌曲列表-->
    <div :style="listStyle">
      <TrackListItem
        v-for="(track, index) in tracks"
        :key="itemkey === 'id' ? track.id : `${track.id}${index}`"
        :track-props="track"
        :is-highlight-playing-track="isHighlightPlayingTrack"
        :class="`item-${index}`"
        @play-this-list="playThisList"
        @dblclick="playThisList(track.id || track.songId)"
        @click.right="openMenu($event, track, index)"
      />

      <ContexMenu ref="menu">
        <div></div>
        <ContexMenu />
      </ContexMenu>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, reactive, ref, withDefaults } from 'vue'

import player from '../utils/Player'
import ContexMenu from './ContexMenu.vue'

import TrackListItem from '@/components/TrackListItem.vue'

const rightClickedTrack = reactive({
  id: 0,
  name: '',
  ar: [{ name: '' }],
  al: { picUrl: '' },
})
// eslint-disable-next-line no-unused-vars
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
  doubleClickTrackFunc: string
  albumObject: AlbumObject
  id: number
  extraDropDownMenuItem: string[]
  columnNumber: number
  isHighlightPlayingTrack: boolean
  itemkey: string
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'trackList',
  dbclickTrackFunc: 'default',
  id: 0,
  columnNumber: 4,
  isHighlightPlayingTrack: true,
  itemkey: 'id',
})

const playThisListDefault = (trackID: number) => {
  switch (props.itemType) {
    case 'playlist':
      player.playPlaylistByID(props.id, trackID)
      break
    case 'album':
      player.playAlbumByID(props.id, trackID)
      break
    case 'tracklist':
      // eslint-disable-next-line no-case-declarations
      const trackIDs = props.tracks.map((t) => t.id)
      player.replacePlaylist(trackIDs, props.id, 'artist', trackID)
      break
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
    // No default
  }
}

const openMenu = (e: any, track: any, index = -1) => {
  rightClickedTrack.id = track.id
  rightClickedTrack.name = track.name
  rightClickedTrack.name = track.ar
  rightClickedTrack.al = track.al
  rightClickedTrackIndex.value = -1
  menu.value.openMenue(e)
}
</script>
