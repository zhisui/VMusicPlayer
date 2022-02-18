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

        <div class="songs">歌曲列表</div>
      </div>
    </div>

    <div id="part2"></div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import NProgress from 'nprogress'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getLyric, getMP3 } from '@/api/track'
import { userDataStore } from '@/store/userData'
import { randomNum } from '@/utils/common'

const store = userDataStore()
const router = useRouter()

const show = ref<boolean>(false)
// const likeSongs = ref([])
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
const getMusic = () => {
  getMP3({ id: 559227860 }).then((result) => {
    console.log(result)
  })
}
getMusic()

// 路由部分
const tolikeSongsList = () => {
  router.push({ name: 'likeSongs' })
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
      p {
        font-size: 14px;
        margin-bottom: -10px;
        color: var(--primary-color);
      }
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
