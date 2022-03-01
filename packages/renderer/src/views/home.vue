<template>
  <div v-show="data.show" class="home">
    <div
      v-if="storeSetting.showPlaylistsByAppleMusic !== false"
      class="index-row first-row"
    >
      <div class="title">by Apple Music</div>
      <CoverRow
        :type="'playlist'"
        :items="byApplemusic"
        sub-text="appleMusic"
        :image-size="1024"
      />
    </div>

    <div class="index-row">
      <div class="title">
        推荐歌单
        <router-link to="/explore?category=推荐歌单">
          查看全部
        </router-link>
      </div>
      <CoverRow
        :type="'playlist'"
        :items="data.recommendPlaylist.items"
        sub-text="copywriter"
      />
    </div>

    <div class="index-row">
      <div class="title">For You</div>
      <div class="for-you-row">
        <DailyTracksCard ref="dailyTracksCard" />
        <FMCard />
      </div>
    </div>

    <div class="index-row">
      <div class="title">推荐艺人</div>
      <CoverRow type="artist" :column-number="6" :items="data.recommendArtists.items" />
    </div>

    <div class="index-row">
      <div class="title">
        新专速递
        <router-link to="/new-album">查看全部</router-link>
      </div>
      <CoverRow type="album" :items="data.newReleasesAlbum.items" sub-text="artist" />
    </div>

    <div class="index-row">
      <div class="title">
        排行榜
        <router-link to="/explore?category=排行榜">
          查看全部
        </router-link>
      </div>
      <CoverRow
        type="playlist"
        :items="data.topList.items"
        sub-text="updateFrequency"
        :image-size="1024"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import NProgress from 'nprogress'
import { computed, onActivated, reactive, ref } from 'vue'

import { settingStore } from '../store/settingStore'

import { newAlbums } from '@/api/album'
import { toplistOfArtists } from '@/api/artist'
import { getPlaylistDetail, recommendPlaylist, toplists } from '@/api/playlist'
import CoverRow from '@/components/CoverRow.vue'
import DailyTracksCard from '@/components/DailyTracksCard.vue'
import FMCard from '@/components/FMCard.vue'
import { byAppleMusic } from '@/utils/staticData'

const dailyTracksCard = ref()
const data = reactive({
  show: false,
  recommendPlaylist: { items: [] },
  newReleasesAlbum: { items: [] },
  topList: {
    items: [],
    ids: [19723756, 180106, 60198, 3812895, 60131],
  },
  recommendArtists: {
    items: [],
    indexs: [],
  },
})

const byApplemusic = computed(() => {
  return byAppleMusic
})
const storeSetting = settingStore()

const loadData = () => {
  setTimeout(() => {
    if (!data.show) NProgress.start()
  }, 1000)
  recommendPlaylist({
    limit: 10,
  }).then((res: any) => {
    data.recommendPlaylist.items = res.result
    NProgress.done()
    data.show = true
  })
  newAlbums({
    area: storeSetting.musicLanguage ?? 'ALL',
    limit: 10,
  }).then((res: any) => {
    data.newReleasesAlbum.items = res.albums
  })

  const toplistOfArtistsAreaTable = {
    all: null,
    zh: 1,
    ea: 2,
    jp: 4,
    kr: 3,
  }
  toplistOfArtists(toplistOfArtistsAreaTable[settingStore.musicLanguage ?? 'all']).then(
    (res: any) => {
      const indexs: number[] = []
      while (indexs.length < 6) {
        const tmp = ~~(Math.random() * 100)
        if (!indexs.includes(tmp)) indexs.push(tmp)
      }
      data.recommendArtists.indexs = indexs
      data.recommendArtists.items = res.list.artists.filter((l: any, index: any) =>
        indexs.includes(index)
      )
    }
  )
  toplists().then((res: any) => {
    data.topList.items = res.list.filter((l: any) => data.topList.ids.includes(l.id))
  })

  // dailyTracksCard.value.loadDailyTracks()
}
getPlaylistDetail({ id: 7279414522, noCache: true }).then((res) => {
  console.log(res)
})
loadData()
onActivated(() => {
  loadData()
})
// player._init()
</script>

<style lang="scss" scoped>
.home {
  padding-right: 10vw;
  padding-left: 10vw;
}
.index-row {
  margin-top: 54px;
}
.index-row.first-row {
  margin-top: 32px;
  z-index: -1;
}
.playlists {
  display: flex;
  flex-wrap: wrap;
  margin: {
    right: -12px;
    left: -12px;
  }
  .index-playlist {
    margin: 12px 12px 24px 12px;
  }
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}

footer {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.for-you-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 78px;
}
</style>
-
