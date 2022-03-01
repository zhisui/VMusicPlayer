<template>
  <div v-show="data.show" class="playlist">
    <!-- 一般的歌单显示 -->
    <div
      v-if="specialPlaylistInfo === undefined && !isLikeSongsPage()"
      class="playlist-info"
    >
      <Cover
        :id="data.playlist.id"
        :image-url="resizeImage(data.playlist.coverImgUrl, 1024)"
        :show-play-button="true"
        :always-show-shadow="true"
        :click-cover-to-play="true"
        :fixed-size="288"
        type="playlist"
        :cover-hover="false"
        :play-button-size="18"
        @click.right="openMenu"
      />
      <div class="info">
        <div class="title" @click.right="openMenu">
          <span v-if="data.playlist.privacy === 10" class="lock-icon">
            <Icon icon="dashicons:lock-duplicate" />
          </span>
          {{ data.playlist.name }}
        </div>
        <div class="artist">
          Playlist by
          <span
            v-if="
              [5277771961, 5277965913, 5277969451, 5277778542, 5278068783].includes(
                data.playlist.id
              )
            "
            style="font-weight: 600;"
          >
            Apple Music
          </span>
          <a
            v-else
            :href="`https://music.163.com/#/user/home?id=${data.playlist.creator.userId}`"
            target="blank"
          >
            {{ data.playlist.creator.nickname }}
          </a>
        </div>
        <div class="date-and-count">
          {{
            `最后更新于
          ${formatDate(data.playlist.updateTime)} ·  ${data.playlist.trackCount}
          首歌`
          }}
        </div>
        <div class="description" @click="data.showFullDescription = true">
          {{ data.playlist.description }}
        </div>
        <div class="buttons">
          <button @click="playPlaylistByID()">
            播放
            <Icon icon="bi:play-fill" class="icon" />
          </button>
          <button
            v-if="data.playlist.creator.userId !== storeUser.user.userId"
            @click="likePlaylist()"
          >
            <Icon
              v-if="data.playlist.subscribed"
              icon="ant-design:heart-filled"
              class="icon"
            />
            <Icon
              v-if="!data.playlist.subscribed"
              icon="ant-design:heart-outlined"
              class="icon"
            />
          </button>
          <button
            :icon-button="true"
            :horizontal-padding="0"
            color="grey"
            @click="openMenu"
          >
            <Icon icon="akar-icons:more-horizontal" class="icon" />
          </button>
        </div>
      </div>

      <div v-if="data.displaySearchInPlaylist" class="search-box">
        <div>我在这里</div>
        <div class="container" :class="{ active: data.inputFocus }">
          <Icon icon="ci:search-small" />
          <div class="input">
            <input
              v-model.trim="data.inputSearchKeyWords"
              v-focus
              :placeholder="data.inputFocus ? '' : '搜索歌单音乐'"
              @input="inputDebounce()"
              @focus="data.inputFocus = true"
              @blur="data.inputFocus = false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 登录后喜欢的歌单页面显示 -->
    <div v-if="isLikeSongsPage()" class="user-info">
      <h1>
        <img class="avatar" :src="resizeImage(storeUser.user.avatarUrl)" />{{
          storeUser.user.nickname + '喜欢的音乐'
        }}
      </h1>
      <div class="search-box-likepage" @click="searchInPlaylist()">
        <div class="container" :class="{ active: data.inputFocus }">
          <Icon icon="fa-solid:search" class="search-icon" />
          <div class="input" :style="{ width: data.searchInputWidth }">
            <input
              v-if="data.displaySearchInPlaylist"
              v-model.trim="data.inputSearchKeyWords"
              v-focus
              :placeholder="data.inputFocus ? '' : '搜索歌单音乐'"
              @input="inputDebounce()"
              @focus="data.inputFocus = true"
              @blur="data.inputFocus = false"
            />
          </div>
        </div>
      </div>
    </div>

    <TracksList
      :id="data.playlist.id"
      :tracks="filteredTracks()"
      item-type="playlist"
      :extra-context-menu-item="isUserOwnPlaylist() ? ['removeTrackFromPlaylist'] : []"
    />

    <div class="load-more">
      <button
        v-show="data.hasMore"
        color="grey"
        :loading="data.loadingMore"
        @click="loadMore(100)"
      >
        ...
      </button>
    </div>
    <!-- 这里就结束了正常的显示页面 -->
    <Modal
      :show="data.showFullDescription"
      :close="closeFullDescription"
      :show-footer="false"
      :click-outside-hide="true"
      title="歌单介绍"
    >
      {{ data.playlist.description }}
    </Modal>

    <ContextMenu ref="playlistMenu">
      <div class="item" @click="likePlaylist(true)">
        {{ data.playlist.subscribed ? '从音乐库中移除' : '保存到音乐库' }}
      </div>

      <div class="item" @click="searchInPlaylist">
        歌单内搜索
      </div>
      <div
        v-if="data.playlist.creator.userId === storeUser.user.userId"
        class="item"
        @click="editPlaylist"
      >
        编辑歌单信息
      </div>

      <div
        v-if="data.playlist.creator.userId === storeUser.user.userId"
        class="item"
        @click="handleDeletePlaylist"
      >
        删除歌单
      </div>
    </ContextMenu>
  </div>
</template>
<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import NProgress from 'nprogress';
import { computed, reactive, ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'

import { deletePlaylist, getPlaylistDetail, subscribePlaylist } from '../api/playlist'
import { getTrackDetail } from '../api/track'
import { toastStore } from '../store/toastStore'
import { userDataStore } from '../store/userData'
import { isAccountLogin } from '../utils/auth'
import { resizeImage } from '../utils/filters'
import player from '../utils/Player';

import ContextMenu from '@/components/ContextMenu.vue'
import Cover from '@/components/Cover.vue'
import Modal from '@/components/Modal.vue'
import TracksList from '@/components/TracksList.vue'
import {formatDate} from '@/utils/filters'
const storeToast = toastStore()
const storeUser = userDataStore()
const route = useRoute()
const router = useRouter()
const playlistMenu = ref()
const data = reactive({
  show: false,
  playlist: {
    englishTitle:'',
    privacy:0,
    id: 0,
    coverImgUrl: '',
    creator: {
      userId: '',
      nickname:''
    },
    trackIds: [],
    description: '',
    subscribed: true,
    name: '',
    tracks:[],
    trackCount:0,
    updateTime:0,
    updateFrequency:null
  },
  id: 0,
  showFullDescription: false,
  tracks: [],
  loadingMore: false,
  hasMore: false,
  lastLoadedTrackIndex: 9,
  displaySearchInPlaylist: false, // 是否显示搜索框
  searchKeyWords: '', // 搜索使用的关键字
  inputSearchKeyWords: '', // 搜索框中正在输入的关键字
  inputFocus: false,
  debounceTimeout: null,
  searchInputWidth: '0px', // 搜索框宽度
})

const specialPlaylist = {
  2829816518: {
    name: '欧美私人订制',
    gradient: 'gradient-pink-purple-blue',
  },
  2890490211: {
    name: '助眠鸟鸣声',
    gradient: 'gradient-green',
  },
  5089855855: {
    name: '夜的胡思乱想',
    gradient: 'gradient-moonstone-blue',
  },
  2888212971: {
    name: '全球百大DJ',
    gradient: 'gradient-orange-red',
  },
  2829733864: {
    name: '睡眠伴侣',
    gradient: 'gradient-midnight-blue',
  },
  2829844572: {
    name: '洗澡时听的歌',
    gradient: 'gradient-yellow',
  },
  2920647537: {
    name: '还是会想你',
    gradient: 'gradient-dark-blue-midnight-blue',
  },
  2890501416: {
    name: '助眠白噪声',
    gradient: 'gradient-sky-blue',
  },
  5217150082: {
    name: '摇滚唱片行',
    gradient: 'gradient-yellow-red',
  },
  2829961453: {
    name: '古风音乐大赏',
    gradient: 'gradient-fog',
  },
  4923261701: {
    name: 'Trance',
    gradient: 'gradient-light-red-light-blue ',
  },
  5212729721: {
    name: '欧美点唱机',
    gradient: 'gradient-indigo-pink-yellow',
  },
  3103434282: {
    name: '甜蜜少女心',
    gradient: 'gradient-pink',
  },
  2829896389: {
    name: '日系私人订制',
    gradient: 'gradient-yellow-pink',
  },
  2829779628: {
    name: '运动随身听',
    gradient: 'gradient-orange-red',
  },
  2860654884: {
    name: '独立女声精选',
    gradient: 'gradient-sharp-blue',
  },
  898150: {
    name: '浪漫婚礼专用',
    gradient: 'gradient-pink',
  },
  2638104052: {
    name: '牛奶泡泡浴',
    gradient: 'gradient-fog',
  },
  5317236517: {
    name: '后朋克精选',
    gradient: 'gradient-pink-purple-blue',
  },
  2821115454: {
    name: '一周原创发现',
    gradient: 'gradient-blue-purple',
  },
  3136952023: {
    name: '私人雷达',
    gradient: 'gradient-radar',
  },
}

const specialPlaylistInfo = computed(() => {
  return specialPlaylist[data.playlist.id]
})

const isLikeSongsPage = () => {
  return route.name === 'likedSongs'
}

const openMenu = (e:MouseEvent) => {
playlistMenu.value.openMenu(e)
}

const closeFullDescription = () => {
  data.showFullDescription = false
}

// 保存到音乐库或者从音乐库中删除（收藏歌单或者取消收藏歌单）
const likePlaylist = (toast = false) => {
  if (!isAccountLogin()) {
    storeToast.showToast('此操作需登录网易云音乐')
    return
  }
  subscribePlaylist({
    id: data.playlist.id,
    t: data.playlist.subscribed ? 2 : 1,
  }).then((res: any) => {
    if (res.code === 200) {
      data.playlist.subscribed = !data.playlist.subscribed
      if (toast === true) {
        storeToast.showToast(data.playlist.subscribed ? '已保存到音乐库' : '已从音乐库删除')
      }
    }
    getPlaylistDetail({ id: data.id, noCache: true }).then((result: any) => {
      data.playlist = result.playlist
    })
  })
}

 const isUserOwnPlaylist = () =>  {
      return (
        data.playlist.creator.userId === storeUser.userId &&
        data.playlist.id !== storeUser.likedSongPlaylistID
      );
    }

const loadMore = (loadNum = 100) => {
  // eslint-disable-next-line array-callback-return
  let trackIDs = data.playlist.trackIds.filter((t:any, index) => {
    if (index > data.lastLoadedTrackIndex && index <= data.lastLoadedTrackIndex + loadNum) {
      return t
    }
  })
  trackIDs = trackIDs.map((t:any) => t.id)
  getTrackDetail(trackIDs.join(',')).then((res: {songs:[]}) => {
    data.tracks.push(...res.songs)
    data.lastLoadedTrackIndex += trackIDs.length
    data.loadingMore = false
    data.hasMore = data.lastLoadedTrackIndex + 1 !== data.playlist.trackIds.length
  })
}

 const filteredTracks = () => {
      return data.tracks.filter(
        (track:any)=>
          (track.name &&
            track.name
              .toLowerCase()
              .includes(data.searchKeyWords.toLowerCase())) ||
          (track.al.name &&
            track.al.name
              .toLowerCase()
              .includes(data.searchKeyWords.toLowerCase())) ||
          track.ar.find(
            (artist:any) =>
              artist.name &&
              artist.name
                .toLowerCase()
                .includes(data.searchKeyWords.toLowerCase())
          )
      );
    }

const searchInPlaylist = () => {
  data.displaySearchInPlaylist = !data.displaySearchInPlaylist || isLikeSongsPage()
  console.log(data.displaySearchInPlaylist);

  if (data.displaySearchInPlaylist === false) {
    data.searchKeyWords = ''
    data.inputSearchKeyWords = ''
  } else {
    data.searchInputWidth = '172px'
    loadMore(500)
  }
}

 const editPlaylist = () => {
      alert('此功能开发中');
    }
const handleDeletePlaylist = () => {
      if (!isAccountLogin()) {
        storeToast.showToast('此操作需登录网易云音乐');
        return;
      }
      // eslint-disable-next-line no-restricted-globals
      const confirmation = confirm(`确定要删除歌单 ${data.playlist.name}？`);
      if (confirmation === true) {
        deletePlaylist(data.playlist.id).then((res:any)=> {
          if (res.code === 200) {
            alert(`已删除歌单 ${data.playlist.name}`);
            router.go(-1);
          } else {
            alert('发生错误');
          }
        });
      }
    }

const playPlaylistByID = (trackID = '0') =>  {
      const trackIDs = data.playlist.trackIds.map((t:any) => t.id);
     player.replacePlaylist(
        trackIDs,
        data.playlist.id,
        'playlist',
        Number(trackID)
      );
    }

 const inputDebounce =() =>{
      if (data.debounceTimeout) clearTimeout(data.debounceTimeout)
      data.debounceTimeout = setTimeout(() => {
        data.searchKeyWords = data.inputSearchKeyWords
      }, 600);
    }

// const removeTrack = (trackID: number) => {
//   if (!isAccountLogin()) {
//     storeToast.showToast('此操作需登录网易云音乐')
//     return
//   }
//   data.tracks = data.tracks.filter((t: any) => t.id !== trackID)
// }

const loadData = (id:number) => {
      data.id = id;
      getPlaylistDetail({id:data.id, noCache:true})
        .then(res => {
          data.playlist = res.playlist;
          data.tracks = res.playlist.tracks;
          NProgress.done();

          data.show = true;
          data.lastLoadedTrackIndex = res.playlist.tracks.length - 1;
          data.playlist.trackCount = res.playlist.trackCount
          return data;
        })
        .then(() => {
          if (data.playlist.trackCount > data.tracks.length) {
            data.loadingMore = true;
            loadMore();
          }
        });
    }


    if (route.name === 'likedSongs') {
      loadData(storeUser.likedSongPlaylistID);
    } else {
      loadData(Number(route.params.id));
    }
    setTimeout(() => {
      if (!data.show) NProgress.start();
    }, 1000);
</script>
<style lang="scss" scoped>
.playlist {
  padding-right: 10vw;
  padding-left: 10vw;
  margin-top: 32px;
}

.playlist-info {
  display: flex;
  margin-bottom: 72px;
  position: relative;
  z-index: 100;
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 56px;
    .title {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-text);
    }
    .artist {
      font-size: 18px;
      opacity: 0.88;
      color: var(--color-text);
      margin-top: 24px;
    }
    .date-and-count {
      font-size: 14px;
      opacity: 0.68;
      color: var(--color-text);
      margin-top: 2px;
    }
    .description {
      font-size: 14px;
      opacity: 0.68;
      color: var(--color-text);
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        transition: opacity 0.3s;
        opacity: 0.88;
      }
    }
    .buttons {
      margin-top: 32px;
      display: flex;
      button {
        margin-right: 16px;
        font-size: 20px;
        color: var(--primary-color);
        background-color: var(--color-primary-bg);
        border-radius: 6px;
      }
      .icon {
        width: 20px;
        height: 20px;
      }
    }
  }
}

.special-playlist {
  margin-top: 192px;
  margin-bottom: 128px;
  border-radius: 1.25em;
  text-align: center;

  @keyframes letterSpacing4 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 4px;
    }
  }

  @keyframes letterSpacing1 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 1px;
    }
  }

  .title {
    font-size: 84px;
    line-height: 1.05;
    font-weight: 700;
    text-transform: uppercase;

    letter-spacing: 4px;
    animation-duration: 0.8s;
    animation-name: letterSpacing4;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    // background-image: linear-gradient(
    //   225deg,
    //   var(--color-primary),
    //   var(--color-primary)
    // );

    img {
      height: 78px;
      border-radius: 0.125em;
      margin-right: 24px;
    }
  }
  .subtitle {
    font-size: 18px;
    letter-spacing: 1px;
    margin: 28px 0 54px 0;
    animation-duration: 0.8s;
    animation-name: letterSpacing1;
    text-transform: uppercase;
    color: var(--color-text);
  }
  .buttons {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    button {
      margin-right: 16px;
    }
  }
}

.gradient-test {
  background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
}

[data-theme='dark'] {
  .gradient-radar {
    background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
  }
}

.gradient-radar {
  background-image: linear-gradient(to left, #0ba360 0%, #3cba92 100%);
}

.gradient-blue-purple {
  background-image: linear-gradient(45deg, #89c4f5 0%, #6284ff 42%, #ff0000 100%);
}

.gradient-sharp-blue {
  background-image: linear-gradient(45deg, #00c6fb 0%, #005bea 100%);
}

.gradient-yellow-pink {
  background-image: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
}

.gradient-pink {
  background-image: linear-gradient(45deg, #ee9ca7 0%, #ffdde1 100%);
}

.gradient-indigo-pink-yellow {
  background-image: linear-gradient(43deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%);
}

.gradient-light-red-light-blue {
  background-image: linear-gradient(
    225deg,
    hsl(190, 30%, 50%) 0%,
    #081abb 38%,
    #ec3841 58%,
    hsl(13, 99%, 49%) 100%
  );
}

.gradient-fog {
  background: linear-gradient(-180deg, #bcc5ce 0%, #929ead 98%),
    radial-gradient(at top left, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%);
  background-blend-mode: screen;
}

.gradient-red {
  background-image: linear-gradient(213deg, #ff0844 0%, #ffb199 100%);
}

.gradient-sky-blue {
  background-image: linear-gradient(147deg, #48c6ef 0%, #6f86d6 100%);
}

.gradient-dark-blue-midnight-blue {
  background-image: linear-gradient(213deg, #09203f 0%, #537895 100%);
}

.gradient-yellow-red {
  background: linear-gradient(147deg, #fec867 0%, #f72c61 100%);
}

.gradient-yellow {
  background: linear-gradient(147deg, #fceb02 0%, #fec401 100%);
}

.gradient-midnight-blue {
  background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
}

.gradient-orange-red {
  background-image: linear-gradient(147deg, #ffe53b 0%, #ff2525 74%);
}

.gradient-moonstone-blue {
  background-image: linear-gradient(
    147deg,
    hsl(200, 34%, 8%) 0%,
    hsl(204, 35%, 38%) 50%,
    hsl(200, 34%, 18%) 100%
  );
}

.gradient-pink-purple-blue {
  background-image: linear-gradient(
    to right,
    #ff3cac 0%,
    #784ba0 50%,
    #2b86c5 100%
  ) !important;
}

.gradient-green {
  background-image: linear-gradient(90deg, #c6f6d5, #68d391, #38b2ac) !important;
}

.user-info {
  margin-top: 50px;
  z-index: -1;
  h1 {
    font-size: 42px;
    position: relative;
    color: var(--color-text);
    .avatar {
      height: 44px;
      width: 44px;
      margin-right: 12px;
      vertical-align: -7px;
      border-radius: 50%;
      border: rgba(0, 0, 0, 0.2);
    }
  }
}

.search-box {
  z-index: -1;
  display: flex;
  position: absolute;
  right: 20px;
  bottom: -55px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    width: 200px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
    margin: {
      left: 8px;
      right: 4px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme='dark'] {
  .search-box {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

.search-box-likepage {
  display: flex;
  position: absolute;
  right: 12vw;
  top: 95px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .input {
    transition: all 0.5s;
  }

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
    margin: {
      left: 8px;
      right: 8px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme='dark'] {
  .search-box-likepage {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

@media (max-width: 1336px) {
  .search-box-likepage {
    right: 8vw;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
