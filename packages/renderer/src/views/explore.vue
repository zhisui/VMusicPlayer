<template>
  <div class="explore-page">
    <h1>发现</h1>

    <!-- 分类按钮 -->
    <div class="buttons">
      <div
        v-for="category in storeSetting.enabledPlaylistCategories"
        :key="category"
        class="button"
        :class="{ active: category === data.activeCategory && !data.showCatOption }"
        @click="goToCategory(category)"
      >
        {{ category }}
      </div>
      <div
        class="button more"
        :class="{ active: data.showCatOptions }"
        @click="data.showCatOptions = !data.showCatOptions"
      >
        <Icon icon="akar-icons:more-horizontal-fill" icon-class="more" />
      </div>
    </div>

    <!-- 隐藏的分类 -->
    <div v-show="data.showCatOptions" class="panel">
      <div v-for="bigCat in data.allBigCats" :key="bigCat" class="big-cat">
        <div class="name">{{ bigCat }}</div>
        <div class="cats">
          <div
            v-for="cat in getCatsByBigCat(bigCat)"
            :key="cat.name"
            :class="{ active: storeSetting.enabledPlaylistCategories.includes(cat.name) }"
            class="cat"
            @click="toggleCat(cat.name)"
          >
            <span>{{ cat.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 歌单显示区域 -->
    <div class="playlists">
      <CoverRow
        type="playlist"
        :items="data.playlists"
        :sub-text="subText"
        :show-play-button="true"
        :show-play-count="data.activeCategory !== '排行榜' ? true : false"
        :image-size="data.activeCategory !== '排行榜' ? 512 : 1024"
      />
    </div>

    <!-- 加载更多按钮 -->
    <div
      v-show="['推荐歌单', '排行榜'].includes(data.activeCategory) === false"
      class="load-more"
    >
      <button
        v-show="data.showLoadMoreButton && data.hasMore"
        color="grey"
        :loading="data.loadingMore"
        @click="getPlayList"
      >
        加载更多
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import NProgress from 'nprogress'
import { computed, onActivated, reactive } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import { settingStore } from '../store/settingStore'

import {
  highQualityPlaylist,
  recommendPlaylist,
  toplists,
  topPlaylist,
} from '@/api/playlist'
import CoverRow from '@/components/CoverRow.vue'
import { playlistCategories } from '@/utils/staticData'
const storeSetting = settingStore()
const route = useRoute()
const router = useRouter()
const data = reactive({
  show: false,
  playlists: [],
  activeCategory: '全部',
  loadingMore: false,
  showLoadMoreButton: false,
  hasMore: true,
  allBigCats: ['语种', '风格', '场景', '情感', '主题'],
  showCatOptions: false,
})

const subText = computed(() => {
  if (data.activeCategory === '排行榜') return 'updateFrequency'
  if (data.activeCategory === '推荐歌单') return 'copyRight'
  return 'none'
})

const getCatsByBigCat = (name: string) => {
  return playlistCategories.filter((c) => c.bigCat === name)
}

const toggleCat = (name: string) => {
  const index = storeSetting.enabledPlaylistCategories.indexOf(name)
  // 如果在buttons中存在，则去除掉
  if (index !== -1) {
    storeSetting.enabledPlaylistCategories = storeSetting.enabledPlaylistCategories.filter(
      (c) => c !== name
    )
    // 如果在buttons中不存在，则加上
  } else {
    storeSetting.enabledPlaylistCategories.push(name)
  }
}

const updatePlaylist = (playlists: never[]) => {
  data.playlists.push(...playlists)
  data.loadingMore = false
  data.showLoadMoreButton = true
  NProgress.done()
  data.show = true
}

const getRecommendPlayList = () => {
  recommendPlaylist({ limit: 100 }).then((res: any) => {
    data.playlists = []
    updatePlaylist(res.result)
  })
}
const getHighQualityPlaylist = () => {
  const playlists = data.playlists
  const before = playlists.length !== 0 ? playlists[playlists.length - 1].updateTime : 0
  highQualityPlaylist({
    limit: 50,
    before,
  }).then((data: any) => {
    updatePlaylist(data.playlists)
    data.hasMore = data.more
  })
}

const getTopLists = () => {
  toplists().then((res: any) => {
    data.playlists = []
    updatePlaylist(res.list)
  })
}

const getTopPlayList = () => {
  topPlaylist({
    cat: data.activeCategory,
    offset: data.playlists.length,
  }).then((res: any) => {
    updatePlaylist(res.playlists)
    data.hasMore = res.more
  })
}

const getPlayList = () => {
  data.loadingMore = true
  if (data.activeCategory === '推荐歌单') {
    return getRecommendPlayList()
  }
  if (data.activeCategory === '精品歌单') {
    return getHighQualityPlaylist()
  }
  if (data.activeCategory === '排行榜') {
    return getTopLists()
  }
  return getTopPlayList()
}

const goToCategory = (category: string) => {
  data.showCatOptions = false
  router.push({ name: 'explore', query: { category: category } })
}
// 在一个页面中切换按钮，但是渲染的是同一组件
onBeforeRouteUpdate((to, from) => {
  data.showLoadMoreButton = false
  data.hasMore = true
  data.playlists = []
  data.activeCategory = String(to.query.category)
  getPlayList()
})
const loadData = () => {
  setTimeout(() => {
    if (!data.show) NProgress.start()
  }, 1000)

  data.activeCategory =
    String(route.query.category) === 'undefined' ? '全部' : String(route.query.category)
  getPlayList()
}
// 用onActived虽然可以在每次回到该页面是重新加载新的数据，但是不能保证再次回到该页面后数据可以成功获取到，为了用户体验保险还是在setup里面直接请求数据
loadData()
onActivated(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.explore-page {
  padding-right: 10vw;
  padding-left: 10vw;
}
h1 {
  color: var(--color-text);
  font-size: 56px;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
}
.button {
  user-select: none;
  cursor: pointer;
  padding: 8px 16px;
  margin: 10px 16px 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  border-radius: 10px;
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  transition: 0.2s;

  &:hover {
    background-color: var(--color-primary-bg);
    color: var(--color-primary);
  }
}
.button.active {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
.panel {
  margin-top: 10px;
  background: var(--color-secondary-bg);
  border-radius: 10px;
  padding: 8px;
  color: var(--color-text);

  .big-cat {
    display: flex;
    margin-bottom: 32px;
  }

  .name {
    font-size: 24px;
    font-weight: 700;
    opacity: 0.68;
    margin-left: 24px;
    min-width: 54px;
    height: 26px;
    margin-top: 8px;
  }
  .cats {
    margin-left: 24px;
    display: flex;
    flex-wrap: wrap;
  }
  .cat {
    user-select: none;
    margin: 4px 0px 0 0;
    display: flex;
    // justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 16px;
    transition: 0.2s;
    min-width: 98px;

    span {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      padding: 6px 12px;
      height: 26px;
      border-radius: 10px;
      opacity: 0.88;
      &:hover {
        opacity: 1;
        background-color: var(--color-primary-bg);
        color: var(--color-primary);
      }
    }
  }
  .cat.active {
    color: var(--color-primary);
  }
}

.playlists {
  margin-top: 24px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 60px;
  button {
    font-size: 20px;
    font-weight: 600;
    background-color: var(--color-primary-bg);
    border-radius: 15px;
  }
}
</style>
