<template>
  <h1>喜欢的音乐</h1>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'

import { toastStore } from '../store/toastStore'
import { isAccountLogin } from '../utils/auth'
const storeToast = toastStore()
const data = reactive({
  show: false,
  playlist: {
    id: 0,
    coverImgUrl: '',
    creator: {
      userId: '',
    },
    trackIds: [],
  },
  showFullDescription: false,
  tracks: [],
  loadingMore: false,
  hasMore: false,
  lastLoadedTrackIndex: 9,
  displaySearchInPlaylist: false, // 是否显示搜索框
  searchKeyWords: '', // 搜索使用的关键字
  inputSearchKeyWords: '', // 搜索框中正在输入的关键字
  inputFocus: false,
  debounceTimeout: null,
  searchInputWidth: '0px', // 搜索框宽度
})
const removeTrack = (trackID: number) => {
  if (!isAccountLogin()) {
    storeToast.showToast('此操作需登录网易云音乐')
    return
  }
  data.tracks = data.tracks.filter((t: any) => t.id !== trackID)
}
console.log(removeTrack(4))
</script>
<style lang="scss" scoped></style>
