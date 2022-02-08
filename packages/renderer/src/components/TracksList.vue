/* eslint-disable no-unused-vars */
<template>
  <div class="track-list">
    <!--展示歌曲列表-->
    <div :style="listStyle">
      <TrackListItem
        v-for="(track, index) in tracks"
        :key="itemkey === 'id' ? track.id : `${track.id}${index}`"
        :track-props="track"
        :is-highlight-playing-track="isHighlightPlayingTrack"
        @dblclick="playThisList(track.id || track.songId)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'

import { playerStore } from '../store/playerStore'

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
const playerState = playerStore()

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
// eslint-disable-next-line no-undef
const props = withDefaults(defineProps<Props>(), {
  itemType: 'trackList',
  dbclickTrackFunc: 'default',
  id: 0,
  columnNumber: 4,
  isHighlightPlayingTrack: true,
  itemkey: 'id',
})

// eslint-disable-next-line no-unused-vars
const playThisListDefault = (trackId: number) => {
  switch (props.itemType) {
    case 'playlist':
      console.log(playerState)
      console.log(rightClickedTrack)

    // 待写
    // playerState.playPlayListByID(props.id, trackId)
  }
}
const playThisList = (trackID: number) => {
  switch (props.doubleClickTrackFunc) {
    case 'default':
    //  待写
  }
}
</script>
