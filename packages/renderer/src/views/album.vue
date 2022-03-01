<template>
  <div v-show="data.show" calss="album-page">
    <!-- 封面及基本介绍 -->
    <div class="playlist-info">
      <Cover
        :id="data.album.id"
        :image-url="resizeImage(data.album.picUrl, 1024)"
        type="album"
        :show-play-button="true"
        :always-show-shadow="true"
        :click-cover-to-play="true"
        :fixed-size="288"
        :cover-hover="false"
        :play-button-size="16"
        @click.right="openMenu"
      />
      <div class="info">
        <div class="title">
          {{ data.title }}
        </div>
        <div v-if="data.subtitle !== ''" class="subtitle">
          {{ data.subtitle }}
        </div>

        <div class="artist">
          <span v-if="data.album.artist.id !== 104700">
            <span>{{ formatAlbumType(data.album.type, data.album) }} by </span>
            <router-link :to="`/artist/${data.album.artist.id}`">
              {{ data.album.artist.name }}
            </router-link>
          </span>
          <span v-else>Compilation by Various Artists</span>
        </div>

        <div class="date-and-count">
          <span v-if="data.album.mark === 1056768" class="explicit-symbol">
            <ExplicitSymbol />
          </span>
          <span :title="formatDate(data.album.publishTime)">{{
            new Date(data.album.publishTime).getFullYear()
          }}</span>
          <span> · {{ data.album.size }} 首歌</span> · {{ formatTime(albumTime) }}
        </div>

        <div class="description" @click="data.showFullDescription = true">
          {{ data.album.description }}
        </div>

        <div class="buttons" style="margin-top: 32px;">
          <button icon-class="play" @click="playAlbumByID(data.album.id)">
            <Icon icon="bi:play-fill" width="20px" />
            播放
          </button>
          <button @click="likeAlbum()">
            <Icon
              v-if="data.dynamicDetail.isSub"
              icon="ant-design:heart-filled"
              class="icon"
            />
            <Icon
              v-if="!data.dynamicDetail.isSub"
              icon="ant-design:heart-outlined"
              class="icon"
            />
          </button>
          <button @click="openMenu">
            <Icon icon="ep:more-filled" />
          </button>
        </div>
      </div>
    </div>

    <!-- 播放列表-->
    <div v-if="Object.keys(tracksByDisc).length !== 1">
      <div v-for="(disc, cd) in tracksByDisc" :key="cd">
        <h2 class="disc">Disc {{ cd }}</h2>
        <TracksList
          :id="data.album.id"
          :tracks="disc"
          :type="'album'"
          :album-object="data.album"
        />
      </div>
    </div>
    <div v-else>
      <TracksList
        :id="data.album.id"
        :tracks="data.tracks"
        item-type="'album'"
        :album-object="data.album"
      />
    </div>

    <!-- 专辑发行时间 -->
    <div class="extra-info">
      <div class="album-time"></div>
      <div class="release-date">
        发行于
        {{ formatDate(data.album.publishTime, 'MMMM D, YYYY') }}
      </div>
      <div v-if="data.album.company !== null" class="copyright">
        © {{ data.album.company }}
      </div>
    </div>

    <!-- 显示同一歌手的其他专辑 -->
    <div v-if="filteredMoreAlbums.length !== 0" class="more-by">
      <div class="section-title">
        More by
        <router-link :to="`/artist/${data.album.artist.id}`">
          {{ data.album.artist.name }}
        </router-link>
      </div>
      <div>
        <CoverRow
          type="album"
          :items="filteredMoreAlbums"
          sub-text="albumType+releaseYear"
        />
      </div>
    </div>

    <Modal
      :show="data.showFullDescription"
      :close="
        () => {
          data.showFullDescription = false
        }
      "
      :show-footer="false"
      :click-outside-hide="true"
      title="专辑详情"
    >
      <p class="description-fulltext">
        {{ data.album.description }}
      </p>
    </Modal>

    <ContextMenu ref="albumMenu">
      <div class="item" @click="likeAlbum(true)">
        {{ data.dynamicDetail.isSub ? '从音乐库专辑栏中删除' : '保存到音乐库专辑栏' }}
      </div>
      <div class="item">添加到歌单</div>
      <div class="item" @click="copyUrl(data.album.id)">复制链接</div>
      <div class="item" @click="openInBrowser(data.album.id)">在浏览器中打开</div>
    </ContextMenu>
  </div>
</template>
<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { groupBy } from 'lodash'
import NProgress from 'nprogress'
import { computed, reactive, ref } from 'vue'
import useClipboard from 'vue-clipboard3'
import { useRoute } from 'vue-router'

import { toastStore } from '../store/toastStore'
import player from '../utils/Player'

import { albumDynamicDetail, getAlbum, likeAAlbum } from '@/api/album'
import { getArtistAlbum } from '@/api/artist'
import { getTrackDetail } from '@/api/track'
import ContextMenu from '@/components/ContextMenu.vue'
import Cover from '@/components/Cover.vue'
import CoverRow from '@/components/CoverRow.vue'
import ExplicitSymbol from '@/components/ExplicitSymbol.vue'
import Modal from '@/components/Modal.vue'
import TracksList from '@/components/TracksList.vue'
import { isAccountLogin } from '@/utils/auth'
import { splitAlbumTitle, splitSoundtrackAlbumTitle } from '@/utils/common'
import { formatAlbumType, formatDate, formatTime, resizeImage } from '@/utils/filters'
const route = useRoute()
const albumMenu = ref()
const storeToast = toastStore()
const { toClipboard } = useClipboard()

const data = reactive({
  show: true,
  album: {
    mark: 0,
    name: '',
    id: 0,
    picUrl: '',
    artist: {
      id: 0,
      name: '',
    },
    publishTime: 0,
    type: '',
    size: 0,
    description: '',
    company: '',
  },
  tracks: [],
  showFullDescription: false,
  moreAlbums: [],
  dynamicDetail: { isSub: false },
  subtitle: '',
  title: '',
})

const albumTime = computed(() => {
  let time = 0
  data.tracks.map((t: any) => (time = time + t.dt))
  return time
})

const tracksByDisc = computed(() => {
  return groupBy(data.tracks, 'cd')
})

const filteredMoreAlbums = computed(() => {
  const moreAlbums = data.moreAlbums.filter((a: any) => a.id !== data.album.id)
  const realAlbums = moreAlbums.filter((a: any) => a.type === '专辑')
  const eps = moreAlbums.filter(
    (a: any) => a.type === 'EP' || (a.type === 'EP/Single' && a.size > 1)
  )

  const restItems = moreAlbums.filter(
    (a: any) =>
      !realAlbums.some((a1: any) => a1.id === a.id) &&
      !eps.some((a1: any) => a1.id === a.id)
  )
  if (realAlbums.length === 0) {
    return [...realAlbums, ...eps, ...restItems].slice(0, 5)
  }
  return [...realAlbums, ...restItems].slice(0, 5)
})

const playAlbumByID = (id: number, trackID = '0') => {
  player.playAlbumByID(id, Number(trackID))
}

const likeAlbum = (toast = false) => {
  if (!isAccountLogin) {
    storeToast.showToast('此操作需登录网易云音乐')
  }
  likeAAlbum({
    id: data.album.id,
    t: data.dynamicDetail.isSub ? 0 : 1,
  })
    .then((res: any) => {
      if (res.code === 200) {
        data.dynamicDetail.isSub = !data.dynamicDetail.isSub
        if (toast === true) {
          storeToast.showToast(
            data.dynamicDetail.isSub ? '已保存到音乐库' : '已从音乐库中删除'
          )
        }
      }
    })
    .catch((err) => {
      storeToast.showToast(`${err.response.data.message || err}`)
    })
}

const copyUrl = (id: number) => {
  toClipboard(`https://music.163.com/#/album?id=${id}`)
    .then(() => {
      storeToast.showToast('链接已复制')
    })
    .catch((err) => {
      storeToast.showToast(`复制失败${err}`)
    })
}

const openMenu = (e: MouseEvent) => {
  albumMenu.value.openMenu(e)
}

const openInBrowser = (id: number) => {
  const url = `https://music.163.com/#/album?id=${id}`
  window.open(url)
}

const formatTitle = () => {
  const splitTitle = splitSoundtrackAlbumTitle(data.album.name)
  const splitTitle2 = splitAlbumTitle(splitTitle.title)
  data.title = splitTitle2.title
  if (splitTitle.subtitle !== '' && splitTitle2.subtitle !== '') {
    data.subtitle = splitTitle.subtitle + ' · ' + splitTitle2.subtitle
  } else {
    data.subtitle = splitTitle.subtitle === '' ? splitTitle2.subtitle : splitTitle.subtitle
  }
}
const loadData = (id: number) => {
  setTimeout(() => {
    if (data.show) NProgress.start()
  }, 1000)
  getAlbum({ id }).then((res) => {
    if (res.code === 200) {
      data.album = res.album
      data.tracks = res.songs
      formatTitle()
      NProgress.done()
      data.show = true
      const trackIDs = data.tracks.map((t: any) => t.id)
      getTrackDetail(trackIDs.join(',')).then((res) => (data.tracks = res.songs))

      getArtistAlbum({ id: data.album.artist.id, limit: 100 }).then((res: any) => {
        data.moreAlbums = res.hotAlbums
      })

      albumDynamicDetail(id).then((res: any) => {
        data.dynamicDetail = res
      })
    }
  })
}

loadData(Number(route.params.id))
</script>

<style lang="scss" scoped>
.album-page {
  color: red;
  padding-right: 10vw;
  padding-left: 10vw;
}

.playlist-info {
  display: flex;
  width: 78vw;
  margin-top: 72px;
  margin-bottom: 80px;
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 56px;
    color: var(--color-text);
    .title {
      font-size: 56px;
      font-weight: 700;
    }
    .artist {
      font-size: 18px;
      opacity: 0.88;
      margin-top: 24px;
      a {
        font-weight: 600;
      }
    }
    .data-and-count {
      font-size: 14px;
      opacity: 0.68;
      margin-top: 2px;
    }

    .description {
      user-select: none;
      font-size: 14px;
      opacity: 0.6;
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      white-space: pre-line;
      &:hover {
        transition: opacity 0.6s;
        opacity: 0.8;
      }
    }
    .buttons {
      margin-top: 32px;
      display: flex;
      button {
        margin-right: 16px;
        font-size: 18px;
        color: var(--primary-color);
        background-color: var(--color-primary-bg);
        border-radius: 6px;
      }
    }
  }
}

.disc {
  color: var(--color-text);
}

.explicit-symbol {
  opacity: 0.28;
  color: var(--color-text);
  margin-right: 4px;
  .svg-icon {
    margin-bottom: -3px;
  }
}
.extra-info {
  margin-top: 36px;
  margin-bottom: 36px;
  font-size: 12px;
  opacity: 0.48;
  color: var(--color-text);
  div {
    margin-bottom: 4px;
  }
  .album-time {
    opacity: 0.68;
  }
}

.more-by {
  border-top: 1px solid rgba(128, 128, 128, 0.18);

  padding-top: 22px;
  .section-title {
    font-size: 22px;
    font-weight: 600;
    opacity: 0.88;
    color: var(--color-text);
    margin-bottom: 20px;
  }
}

.description-fulltext {
  font-size: 16px;
  margin-top: 24px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}
</style>
