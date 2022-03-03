<template>
  <div v-show="data.show" class="search-page">
    <div v-show="data.artists.length > 0 || data.albums.length > 0" class="row">
      <div v-show="data.artists.length > 0" class="artists">
        <div v-show="data.artists.length > 0" class="section-title">
          艺人
          <router-link :to="`/search/${keywords}/artists`">
            查看全部
          </router-link>
        </div>
        <CoverRow
          type="artist"
          :column-number="3"
          :items="data.artists.slice(0, 3)"
          gap="34px 65px"
        />
      </div>

      <div class="albums">
        <div v-show="data.albums.length > 0" class="section-title">
          专辑
          <router-link :to="`/search/${keywords}/albums`">
            查看全部
          </router-link>
        </div>
        <CoverRow
          type="album"
          :items="data.albums.slice(0, 3)"
          sub-text="artist"
          :column-number="3"
          sub-text-font-size="14px"
          gap="34px 24px"
        />
      </div>
    </div>

    <div v-show="data.tracks.length > 0" class="tracks">
      <div class="section-title">
        歌曲
        <router-link :to="`/search/${keywords}/tracks`">
          查看全部
        </router-link>
      </div>
      <TracksList :tracks="data.tracks" item-type="tracklist" />
    </div>

    <div v-show="data.musicVideos.length > 0" class="music-videos">
      <div class="section-title">
        视频
        <router-link :to="`/search/${keywords}/music-videos`">
          查看全部
        </router-link>
      </div>
      <MvRow :mvs="data.musicVideos.slice(0, 5)" />
    </div>

    <div v-show="data.playlists.length > 0" class="playlists">
      <div class="section-title">
        歌单
        <router-link :to="`/search/${keywords}/playlists`">
          查看全部
        </router-link>
      </div>
      <CoverRow
        type="playlist"
        :items="data.playlists.slice(0, 12)"
        sub-text="title"
        :column-number="6"
        sub-text-font-size="14px"
        gap="34px 24px"
        :play-button-size="26"
      />
    </div>

    <div v-show="!haveResult" class="no-results">
      <div>
        <Icon icon="fa-solid:search" />
        {{ keywords.length === 0 ? '输入关键字搜索' : '暂无结果' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import NProgress from 'nprogress'
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'

import { toastStore } from '../store/toastStore'

import { search } from '@/api/other'
import { getTrackDetail } from '@/api/track'
import CoverRow from '@/components/CoverRow.vue'
import MvRow from '@/components/MvRow.vue'
import TracksList from '@/components/TracksList.vue'
const route = useRoute()
const storeToast = toastStore()

const data = reactive({
  result: [],
  show: false,
  tracks: [],
  artists: [],
  albums: [],
  playlists: [],
  musicVideos: [],
})

const keywords = computed(() => {
  return route.params.keywords ?? ''
})
const haveResult = computed(() => {
  console.log(data)

  return (
    data.tracks.length +
      data.artists.length +
      data.albums.length +
      data.playlists.length +
      data.musicVideos.length >
    0
  )
})

watch(
  () => keywords.value,
  (newKeywords) => {
    if (!newKeywords) return
    loadData()
  }
)

// const playTrackInSearchResult = (id: number) => {
//   const track = data.tracks.find((t: any) => t.id === id)
//   player.appendTrackToPlayerList(track, true)
// }

const doSearch = (type = 'all') => {
  const typeTable = {
    all: 1018,
    musicVideos: 1004,
    tracks: 1,
    albums: 10,
    artists: 100,
    playlists: 1000,
  }
  return search({
    keywords: keywords.value.toString(),
    type: typeTable[type],
    limit: 16,
  })
    .then((result: any) => {
      return { result: result.result, type }
    })
    .catch((err: any) => {
      storeToast.showToast(err.response.data.msg || err.response.data.message)
    })
}
const loadData = () => {
  setTimeout(() => {
    if (!data.show) NProgress.start()
  }, 1000)
  data.show = false
  const requestAll = (requests: any[]) => {
    Promise.all(requests).then((results) => {
      console.log(results)
      results.forEach((item) => {
        const searchType = item.type
        switch (searchType) {
          case 'all':
            data.result = item.result
            break
          case 'musicVideos':
            data.musicVideos = item.result.mvs ?? []
            break
          case 'artists':
            data.artists = item.result.artists ?? []
            break
          case 'albums':
            data.albums = item.result.albums ?? []
            break
          case 'tracks':
            data.tracks = item.result.songs ?? []
            getTracksDetail()
            break
          case 'playlists':
            data.playlists = item.result.playlists ?? []
            break
        }
      })
      NProgress.done()
      data.show = true
    })
  }
  const requests = [doSearch('artists'), doSearch('albums'), doSearch('tracks')]
  const requests2 = [doSearch('musicVideos'), doSearch('playlists')]

  requestAll(requests)
  requestAll(requests2)
}
const getTracksDetail = () => {
  const trackIDs = data.tracks.map((t: any) => t.id)
  if (trackIDs.length === 0) return
  getTrackDetail(trackIDs.join(',')).then((result) => {
    data.tracks = result.songs
  })
}

loadData()
</script>

<style lang="scss" scoped>
.search-page {
  margin-top: 60px;
  padding-left: 10vw;
  padding-right: 10vw;
}
.section-title {
  font-weight: 600;
  font-size: 22px;
  opacity: 0.88;
  color: var(--color-text);
  margin-bottom: 16px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}

.row {
  display: flex;

  margin-top: 32px;
  flex-wrap: wrap;

  .artists {
    flex: 1;
    margin-right: 8rem;
  }
  .albums {
    flex: 1;
  }
}

.tracks,
.music-videos,
.playlists {
  margin-top: 46px;
}

.no-results {
  position: absolute;
  top: 64px;
  right: 0;
  left: 0;
  bottom: 64px;
  font-size: 24px;
  color: var(--color-text);
  opacity: 0.38;
  display: flex;
  justify-content: center;
  align-items: center;
  div {
    display: flex;
    align-items: center;
  }
  .svg-icon {
    height: 24px;
    width: 24px;
    margin-right: 16px;
  }
}
</style>
