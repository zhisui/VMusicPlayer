<template>
  <div v-show="data.show" class="artist-page">
    <div class="artist-info">
      <div class="head">
        <img :src="resizeImage(data.artist.img1v1Url, 1024)" />
      </div>
      <div>
        <div class="name">{{ data.artist.name }}</div>
        <div class="artist">艺人</div>
        <div class="statistics">
          <a @click="scrollTo('popularTracks')">{{ data.artist.musicSize + '首歌' }}</a>
          ·
          <a @click="scrollTo('seeMore', 'start')">{{ data.artist.albumSize }}张专辑</a>
          ·
          <a @click="scrollTo('mvs')">{{ data.artist.mvSize }} 个MV</a>
        </div>
        <div class="description" @click="toggleFullDescription">
          {{ data.artist.briefDesc }}
        </div>
        <div class="buttons">
          <button @click="playPopularSongs()">
            播放
            <Icon icon="bi:play-fill" width="20px" />
          </button>
          <button @click="followArtist">
            <span v-if="data.artist.followed">正在关注</span>
            <span v-else>关注</span>
          </button>
          <button @click="openMenu">
            <Icon icon="ep:more-filled" />
          </button>
        </div>
      </div>
    </div>
    <div v-if="data.latestRelease !== undefined" class="latest-release">
      <div class="section-title">最新发布</div>
      <div class="release">
        <div class="container">
          <Cover
            :id="data.latestRelease.id"
            :image-url="resizeImage(data.latestRelease.picUrl)"
            type="album"
            :fixed-size="128"
            :play-button-size="30"
          />
          <div class="info">
            <div class="name">
              <router-link :to="`/album/${data.latestRelease.id}`">
                {{ data.latestRelease.name }}
              </router-link>
            </div>
            <div class="date">
              {{ formatDate(data.latestRelease.publishTime) }}
            </div>
            <div class="type">
              {{ formatAlbumType(data.latestRelease.type, data.latestRelease) }} ·
              {{ data.latestRelease.size }} 首歌
            </div>
          </div>
        </div>

        <div v-show="latestMV.id" class="container latest-mv">
          <div
            class="cover"
            @mouseover="data.mvHover = true"
            @mouseleave="data.mvHover = false"
            @click="goToMv(latestMV.id)"
          >
            <img :src="latestMV.coverUrl" />
            <transition name="fade">
              <div
                v-show="data.mvHover"
                class="shadow"
                :style="{
                  background: 'url(' + latestMV.coverUrl + ')',
                }"
              ></div>
            </transition>
          </div>
          <div class="info">
            <div class="name">
              <router-link :to="'/mv/' + latestMV.id">
                {{ latestMV.name }}
              </router-link>
            </div>
            <div class="date">
              {{ formatDate(latestMV.publishTime) }}
            </div>
            <div class="type">最新MV</div>
          </div>
        </div>

        <div v-show="!latestMV.id"></div>
      </div>
    </div>

    <div id="popularTracks" class="popular-tracks">
      <div class="section-title">热门歌曲</div>
      <TracksList
        :tracks="data.popularTracks.slice(0, data.showMorePopTracks ? 24 : 12)"
        item-type="'tracklist'"
      />

      <div id="seeMore" class="show-more">
        <button @click="data.showMorePopTracks = !data.showMorePopTracks">
          <span v-show="!data.showMorePopTracks">显示更多</span>
          <span v-show="data.showMorePopTracks">收起</span>
        </button>
      </div>
    </div>

    <div v-if="albums.length !== 0" id="albums" class="albums">
      <div class="section-title">专辑</div>
      <CoverRow
        type="'album'"
        :items="albums"
        :sub-text="'releaseYear'"
        :show-play-button="true"
      />
    </div>

    <div v-if="data.mvs.length !== 0" id="mvs" class="mvs">
      <div class="section-title">
        MVs
        <router-link v-show="data.hasMoreMV" :to="`/artist/${data.artist.id}/mv`">
          查看全部
        </router-link>
      </div>
      <MvRow :mvs="data.mvs" subtitle="publishTime" />
    </div>
    <div v-if="eps.length !== 0" class="eps">
      <div class="section-title">EP和单曲</div>
      <CoverRow
        type="'album'"
        :items="eps"
        :sub-text="'albumType+releaseYear'"
        :show-play-button="true"
      />
    </div>

    <div v-if="data.similarArtists.length !== 0" class="similar-artists">
      <div class="section-title">相似艺人</div>
      <CoverRow
        type="artist"
        :column-number="5"
        gap="36px 28px"
        :items="data.similarArtists.slice(0, 12)"
      />
    </div>

    <Modal
      :show="data.showFullDescription"
      :close="toggleFullDescription"
      :show-footer="false"
      :click-outside-hide="true"
      title="艺术家介绍"
    >
      <p class="description-fulltext">
        {{ data.artist.briefDesc }}
      </p>
    </Modal>

    <ContextMenu ref="artistMenu">
      <div class="item" @click="copyUrl(data.artist.id)">
        复制链接
      </div>
      <div class="item" @click="openInBrowser(data.artist.id)">
        在浏览器中打开
      </div>
    </ContextMenu>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import NProgress from 'nprogress'
import { computed, onActivated, reactive, ref } from 'vue'
import useClipboard from 'vue-clipboard3'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import player from '../utils/Player'

import {
  artistMv,
  followAArtist,
  getArtist,
  getArtistAlbum,
  similarArtists,
} from '@/api/artist'
import ContextMenu from '@/components/ContextMenu.vue'
import Cover from '@/components/Cover.vue'
import CoverRow from '@/components/CoverRow.vue'
import Modal from '@/components/Modal.vue'
import MvRow from '@/components/MvRow.vue'
import TracksList from '@/components/TracksList.vue'
import { toastStore } from '@/store/toastStore'
import { isAccountLogin } from '@/utils/auth'
import { formatAlbumType, formatDate, resizeImage } from '@/utils/filters'
const route = useRoute()
const router = useRouter()
const storeToast = toastStore()
const artistMenu = ref()
const { toClipboard } = useClipboard()

onBeforeRouteUpdate((to, from) => {
  data.artist.img1v1Url =
    'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg'
  loadData(Number(to.params.id))
})
const data = reactive({
  show: false,
  artist: {
    briefDesc: '',
    img1v1Url: 'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
    id: 0,
    followed: false,
    name: '',
    musicSize: 0,
    albumSize: 0,
    mvSize: 0,
  },
  popularTracks: [],
  albumsData: [],
  latestRelease: {
    picUrl: '',
    publishTime: 0,
    id: 0,
    name: '',
    type: '',
    size: '',
  },
  showMorePopTracks: false,
  showFullDescription: false,
  mvs: [],
  hasMoreMV: false,
  similarArtists: [],
  mvHover: false,
})

const albums = computed(() => {
  return data.albumsData.filter((a: any) => a.type === '专辑')
})
const eps = computed(() => {
  return data.albumsData.filter((a: any) => ['EP/Single', 'EP', 'Single'].includes(a.type))
})
const latestMV = computed(() => {
  const mv = data.mvs[0] || {}
  return {
    id: mv.id || mv.vid,
    name: mv.name || mv.title,
    coverUrl: `${mv.imgurl16v9 || mv.cover || mv.coverUrl}?param=464y260`,
    publishTime: mv.publishTime,
  }
})

const goToMv = (id: number) => {
  router.push({ path: '/mv/' + id })
}

const playPopularSongs = (trackID = '0') => {
  const trackIDs = data.popularTracks.map((t: any) => t.id)
  player.replacePlaylist(trackIDs, data.artist.id, 'artist', Number(trackID))
}

const followArtist = () => {
  if (!isAccountLogin()) {
    storeToast.showToast('此操作需登录网易云音乐')
    return
  }
  followAArtist({
    id: data.artist.id,
    t: data.artist.followed ? 1 : 0,
  }).then((res: any) => {
    if (res.code === 200) data.artist.followed = !data.artist.followed
  })
}

const scrollTo = (div: string, block = 'center') => {
  document.getElementById(div).scrollIntoView({
    behavior: 'smooth',
    block,
  })
}

const toggleFullDescription = () => {
  data.showFullDescription = !data.showFullDescription
}
const openMenu = (e: MouseEvent) => {
  artistMenu.value.openMenu(e)
}

const copyUrl = (id: any) => {
  toClipboard(`https://music.163.com/#/artist?id=${id}`)
    .then(() => {
      storeToast.showToast('链接已复制')
    })
    .catch((err: any) => {
      storeToast.showToast(`复制失败${err}`)
    })
}
const openInBrowser = (id: number) => {
  const url = `https://music.163.com/#/artist?id=${id}`
  window.open(url)
}

const loadData = (id: number) => {
  setTimeout(() => {
    if (!data.show) NProgress.start()
  }, 1000)
  data.show = false
  getArtist({ id }).then((res) => {
    data.artist = res.artist
    data.popularTracks = res.hotSongs
    NProgress.done()
    data.show = true
  })
  getArtistAlbum({ id: id, limit: 200 }).then((res: any) => {
    data.albumsData = res.hotAlbums
    data.latestRelease = res.hotAlbums[0]
  })
  artistMv({ id }).then((res: any) => {
    data.mvs = res.mvs
    data.hasMoreMV = res.hasMore
  })
  similarArtists(id).then((res: any) => {
    data.similarArtists = res.artists
  })
}

onActivated(() => {
  if (data.artist?.id?.toString() !== route.params.id) {
    loadData(Number(route.params.id))
  }
})
</script>

<style lang="scss" scoped>
.artist-page {
  margin-top: 32px;
  padding-right: 10vw;
  padding-left: 10vw;
}

.artist-info {
  display: flex;
  align-items: center;
  margin-bottom: 26px;
  color: var(--color-text);
  img {
    height: 248px;
    width: 248px;
    border-radius: 50%;
    margin-right: 56px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 12px 16px -8px;
  }
  .name {
    font-size: 56px;
    font-weight: 700;
  }

  .artist {
    font-size: 18px;
    opacity: 0.88;
    margin-top: 24px;
  }

  .statistics {
    font-size: 14px;
    opacity: 0.68;
    margin-top: 2px;
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
    .icon {
      width: 20px;
      height: 20px;
    }
  }

  .description {
    user-select: none;
    font-size: 14px;
    opacity: 0.68;
    margin-top: 24px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    cursor: pointer;
    white-space: pre-line;
    &:hover {
      transition: opacity 0.3s;
      opacity: 0.88;
    }
  }
}

.section-title {
  font-weight: 600;
  font-size: 22px;
  opacity: 0.88;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-top: 46px;

  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}

.latest-release {
  color: var(--color-text);
  .release {
    display: flex;
  }
  .container {
    display: flex;
    flex: 1;
    align-items: center;
    border-radius: 12px;
  }
  img {
    height: 96px;
    border-radius: 8px;
  }
  .info {
    margin-left: 24px;
  }
  .name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .date {
    font-size: 14px;
    opacity: 0.78;
  }
  .type {
    margin-top: 2px;
    font-size: 12px;
    opacity: 0.68;
  }
}

.popular-tracks {
  .show-more {
    display: flex;

    button {
      padding: 4px 8px;
      margin-top: 8px;
      border-radius: 6px;
      font-size: 12px;
      opacity: 0.78;
      color: var(--color-secondary);
      font-weight: 600;
      &:hover {
        opacity: 1;
      }
    }
  }
}

.similar-artists {
  .section-title {
    margin-bottom: 24px;
  }
}

.latest-mv {
  .cover {
    position: relative;
    transition: transform 0.3s;
    &:hover {
      cursor: pointer;
    }
  }
  img {
    border-radius: 0.75em;
    height: 128px;
    object-fit: cover;
    user-select: none;
  }

  .shadow {
    position: absolute;
    top: 6px;
    height: 100%;
    width: 100%;
    filter: blur(16px) opacity(0.4);
    transform: scale(0.9, 0.9);
    z-index: -1;
    background-size: cover;
    border-radius: 0.75em;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
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
