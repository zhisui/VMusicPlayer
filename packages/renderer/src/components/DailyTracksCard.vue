<template>
  <div class="daily-recommend-card" @click="goToDailyTracks">
    <img :src="coverUrl" />

    <div class="container">
      <div class="title-box">
        <div class="title">
          <span>每</span>
          <span>日</span>
          <span>推</span>
          <span>荐</span>
        </div>
      </div>
    </div>

    <button class="play-button" @click.stop="playDailyTracks">
      <Icon icon="bi:play-fill" class="svg-icon" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import sample from 'lodash/sample'
import { computed, defineExpose } from 'vue'
import { useRouter } from 'vue-router'

import { dailyTracksStore } from '../store/dailyTracksStore'
import { toastStore } from '../store/toastStore'
import player from '../utils/Player'

import { dailyRecommendTracks } from '@/api/playlist'
import { isAccountLogin } from '@/utils/auth'

const storeDailyTracks = dailyTracksStore()
const storeToast = toastStore()
const router = useRouter()
const defaultCovers = [
  'https://p2.music.126.net/0-Ybpa8FrDfRgKYCTJD8Xg==/109951164796696795.jpg',
  'https://p2.music.126.net/QxJA2mr4hhb9DZyucIOIQw==/109951165422200291.jpg',
  'https://p1.music.126.net/AhYP9TET8l-VSGOpWAKZXw==/109951165134386387.jpg',
]

const coverUrl = computed(() => {
  return `${
    storeDailyTracks.dailyTracks[0]?.al.picUrl || sample(defaultCovers)
  }?param=1024y1024`
})

const loadDailyTracks = () => {
  // if (!isAccountLogin()) return
  dailyRecommendTracks()
    .then((result) => {
      console.log(result)

      storeDailyTracks.dailyTracks = result.data.dailySongs
    })
    .catch((err) => {
      console.log(err)
    })
}
// 页面渲染后获取数据
if (storeDailyTracks.dailyTracks.length === 0) loadDailyTracks()

const goToDailyTracks = () => {
  router.push({ name: 'dailySongs' })
}
const playDailyTracks = () => {
  if (!isAccountLogin()) {
    storeToast.showToast('此操作需登录网易云音乐')
    return
  }
  const trackIDs = storeDailyTracks.dailyTracks.map((t) => t.id)
  player.replacePlaylist(
    trackIDs,
    // 每日推荐返回的结果中没有歌单ID，故传入第一首歌曲的id
    storeDailyTracks.dailyTracks[0].id,
    'url',
    storeDailyTracks.dailyTracks[0].id
  )
}

defineExpose({
  loadDailyTracks,
})
</script>

<style lang="scss" scoped>
.daily-recommend-card {
  border-radius: 1rem;
  height: 198px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  animation: move 38s infinite;
  animation-direction: alternate;
  z-index: -1;
}

.container {
  background: linear-gradient(to left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.28));
  height: 198px;
  width: 50%;
  display: flex;
  align-items: center;
  border-radius: 0.94rem;
}

.title-box {
  height: 148px;
  width: 148px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 25px;
  user-select: none;
  .title {
    height: 100%;
    width: 100%;
    font-weight: 600;
    font-size: 64px;
    line-height: 48px;
    opacity: 0.96;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: center;
    place-items: center;
  }
}

.play-button {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  position: absolute;
  right: 1.6rem;
  bottom: 1.4rem;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  margin-bottom: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
  width: 44px;
  transition: 0.2s;
  cursor: default;

  .svg-icon {
    margin-left: 4px;
    height: 16px;
    width: 16px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.44);
  }
  &:active {
    transform: scale(0.94);
  }
}

@keyframes move {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
</style>
