<template>
  <div v-show="data.show" class="search-type">
    <h1>
      <span>搜索{{ typeNameTable[type] }}</span> "{{ keywords }}"
    </h1>

    <div v-if="type === 'artists'">
      <CoverRow type="artist" :items="data.result" :column-number="5" />
    </div>
    <div v-if="type === 'albums'">
      <CoverRow
        type="album"
        :items="data.result"
        sub-text="artist"
        sub-text-font-size="14px"
      />
    </div>
    <div v-if="type === 'tracks'">
      <TracksList
        :tracks="data.result"
        item-type="playlist"
        dbclick-track-func="playAList"
      />
    </div>
    <div v-if="type === 'musicVideos'">
      <MvRow :mvs="data.result" />
    </div>
    <div v-if="type === 'playlists'">
      <CoverRow type="playlist" :items="data.result" sub-text="title" />
    </div>

    <div class="load-more">
      <button v-show="data.hasMore" color="grey" @click="loadData">
        加载更多
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { camelCase } from 'change-case'
import NProgress from 'nprogress'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'

import { search } from '@/api/other'
import { getTrackDetail } from '@/api/track'
import CoverRow from '@/components/CoverRow.vue'
import MvRow from '@/components/MvRow.vue'
import TracksList from '@/components/TracksList.vue'
const route = useRoute()

const data = reactive({ show: false, result: [], hasMore: true })

const keywords = computed(() => {
  return route.params.keywords
})
const type = computed(() => {
  return camelCase(String(route.params.type))
})

const typeNameTable = computed(() => {
  return {
    musicVideos: '视频',
    tracks: '歌曲',
    albums: '专辑',
    artists: '艺人',
    playlists: '歌单',
  }
})

const loadData = () => {
  const typeTable = {
    musicVideos: 1004,
    tracks: 1,
    albums: 10,
    artists: 100,
    playlists: 1000,
  }
  return search({
    keywords: keywords.value.toString(),
    type: typeTable[type.value],
    offset: data.result.length,
  }).then((res: any) => {
    const result = res.result
    data.hasMore = result.hasMore ?? true
    switch (String(type.value)) {
      case 'musicVideos':
        data.result.push(...result.mvs)
        if (result.mvCount <= data.result.length) {
          data.hasMore = false
        }
        break
      case 'artists':
        data.result.push(...result.artists)
        break
      case 'albums':
        data.result.push(...result.albums)
        if (result.albumCount <= data.result.length) {
          data.hasMore = false
        }
        break
      case 'tracks':
        data.result.push(...result.songs)
        getTracksDetail()
        break
      case 'playlists':
        data.result.push(...result.playlists)
        break
    }
    NProgress.done()
    data.show = true
  })
}
const getTracksDetail = () => {
  const trackIDs = data.result.map((t: any) => t.id)
  if (trackIDs.length === 0) return
  getTrackDetail(trackIDs.join(',')).then((result) => {
    data.result = result.songs
  })
}
loadData()
</script>

<style lang="scss" scoped>
.search-type {
  margin-top: 60px;
  padding-left: 10vw;
  padding-right: 10vw;
}
h1 {
  margin-top: 32px;
  margin-bottom: 28px;
  color: var(--color-text);
  span {
    opacity: 0.58;
  }
}
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 39px;
  button {
    background-color: var(--color-primary-bg);
    border-radius: 8px;
    font-size: 18px;
  }
}
</style>
