<template>
  <div class="container">
    <h1>
      <img :src="data.user.avatarUrl" />
      {{ data.user.nickname }}的音乐库
    </h1>
    <div id="part1">
      <div class="musiclist">
        <div class="mylike" @click="tolikeSongsList">
          <div class="top">
            <!-- <p v-for="(line, index) in pickedLyric" v-show="line !== ''" :key="line">
              {{ line }}
            </p> -->
          </div>
          <div class="bottom">
            <div>
              <h2>我喜欢的音乐</h2>
              <p>{{ liked.songs.length }}首歌</p>
            </div>
            <button>
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

        <div class="songs" @click.stop="test">歌曲列表</div>
      </div>
    </div>

    <div id="part2"></div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import NProgress from 'nprogress'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { getLyric } from '../api/track.ts'
import { useStore } from '../store/index.ts'
import { randomNum } from '../utils/common.ts'
/* eslint-disable new-cap */
const store = new useStore()
const router = useRouter()
const data = store.state.data
const liked = store.state.liked
// const show = ref(false)
// const likeSongs = ref([])
const lyric = ref(undefined) // 字符串类型

// const pickedLyric = computed(() => {
//   console.log(lyric.value)
//   if (!lyric.value) return []
//   const lyricLine = lyric.value
//     .split('\n')
//     .filter((line) => !line.includes('作词') && !line.includes('作曲'))
//   // 最多显示3行歌词
//   const lyricsToPick = Math.min(lyricLine.length, 3)
//   const randomUpperBound = lyricLine.length - lyricsToPick
//   const stratLyricLineIndex = randomNum(0, randomUpperBound - 1)
//   // 将选中的3行以下歌词显示出来
//   const lyrics = lyricLine
//     .slice(stratLyricLineIndex, stratLyricLineIndex + lyricsToPick)
//     .map((lir) => lir.split(']')[1].trim())
//   console.log(lyrics)
//   return lyrics
// })

const getRandomLyric = () => {
  if (liked.songs.length === 0) return
  getLyric(liked.songs[randomNum(0, liked.songs.length)]).then((res) => {
    if (res.lrc !== undefined) {
      const lyricWithDate = res.lrc.lyric
        .split('\n')
        .filter((lyric) => !lyric.includes('纯音乐，请欣赏'))
      if (lyricWithDate.length !== 0) lyric.value = res.lrc.lyric
      console.log(lyric.value)
    }
  })
}
getRandomLyric()

const getData = () => {
  store.dispatch('fetchLikedSongsWithDetails')
  store.dispatch('fetchLikedSongsIDs')
  store.dispatch('fetchLikedAlbums')
  store.dispatch('fetchLikedArtists')
  store.dispatch('fetchLikedMVs')
  if (liked.songsWithDetails.length > 0) NProgress.done()
}

getData()

// 路由部分
const tolikeSongsList = () => {
  router.push({ name: 'likeSongs' })
}

// 去掉歌词的时间部分[00:27.66]软弱地被乖巧装扮着的颜色
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
    height: 44px;
    border-radius: 50%;
    vertical-align: -6px;
  }
}
#part1 {
  display: flex;
  flex-direction: column;
  margin-top: 24px;
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
    }
    .bottom {
      display: flex;
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
    width: 700px;
    background-color: #456;
  }
}
</style>
