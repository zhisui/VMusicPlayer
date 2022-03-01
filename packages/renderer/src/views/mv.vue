<template>
  <div class="mv-page">
    <div class="current-video">
      <vue3VideoPlay
        v-bind="videoOptions"
        :poster="data.poster"
        @play="stopPlayCurrentMusic"
      />
    </div>

    <div class="more-video">
      <div class="section-title">更多视频</div>
    </div>
    <div class="note">
      {{ videoOptions.title }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'

import { playerStore } from '../store/playerStore'
import player from '../utils/Player'

// import { likeAMV, mvDetail, mvUrl, simiMv } from '@/api/mv'
// import MvRow from '@/components/MvRow.vue'

const videoOptions = reactive({
  width: '700px', // 播放器高度
  height: '390px', // 播放器高度
  color: '#409eff', // 主题色
  title:
    '调用收藏Mv列表返回的数据中无法获得真实的mvid,进而无法获取mv播放地址，也取不到更多类似的mv，先放个视频看下吧，后续再看咋个弄', // 视频名称
  src: 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4', // 视频源
  muted: false, // 静音
  webFullScreen: false,
  speedRate: ['0.75', '1.0', '1.25', '1.5', '2.0'], // 播放倍速
  autoPlay: false, // 自动播放
  loop: false, // 循环播放
  mirror: false, // 镜像画面
  ligthOff: false, // 关灯模式
  volume: 0.3, // 默认音量大小
  control: true, // 是否显示控制
  controlBtns: [
    'audioTrack',
    'quality',
    'speedRate',
    'volume',
    'setting',
    'pip',
    'pageFullScreen',
    'fullScreen',
  ], // 显示所有按钮,
})
const data = reactive({
  volume: 0.3, // 默认音量大小
  src: 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4', // 视频源
  poster: 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/ironMan.jpg', // 视频封面
})

const route = useRoute()
const storePlayer = playerStore()

onMounted(() => {
  videoOptions.volume = storePlayer.volume
  getMvData(Number(route.params.id))
})

const stopPlayCurrentMusic = () => {
  console.log('停止播放当前正在播放的音乐')
  player.pause()
}

const getMvData = (id: number) => {}
</script>

<style scoped>
.mv-page {
  width: 100%;
  margin-top: 32px;
}
.current-video {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.more-video {
  margin-top: 48px;
  text-align: left;
  margin-left: 40px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    opacity: 0.88;
    margin-bottom: 12px;
  }
}
.note {
  margin-top: 20px;
  font-size: 20px;
  padding: 10px 30px;
  color: red;
  line-height: 30px;
}
</style>
