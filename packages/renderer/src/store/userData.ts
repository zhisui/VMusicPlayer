import { defineStore } from 'pinia'

import { isAccountLogin } from '../utils/auth'
import { toastStore } from './toastStore'

import { getPlaylistDetail } from '@/api/playlist'
import { getTrackDetail, likeATrack } from '@/api/track'
import {
  cloudDisk,
  likedAlbums,
  likedArtists,
  likedMVs,
  userLikedSongsIDs,
  userPlayHistory,
  userPlaylist,
} from '@/api/user'

export const userDataStore = defineStore('userData', {
  state: () => ({
    user: {
      userId: 0,
      avatarUrl: '',
      nickname: '',
    },
    likedSongPlaylistID: 2046749523,
    lastRefreshCookieDate: 0,
    loginMode: '',
    liked: {
      playlists: [],
      songs: [0],
      songsWithDetails: [],
      playHistory: {},
      artists: [],
      mvs: [],
      cloudDisk: [],
      albums: [],
    },
  }),

  actions: {
    async fetchLikedPlaylist () {
      if (!isAccountLogin()) return void 0
      await userPlaylist({
        uid: this.user?.userId,
        limit: 1000,
      }).then((res) => {
        this.likedSongPlaylistID = res.playlist[0].id
        this.liked.playlists = res.playlist
      })
    },
    // 获取喜欢的所有歌曲id
    async fetchLikedSongsIDs () {
      if (!isAccountLogin()) return
      await userLikedSongsIDs({ uid: this.user?.userId }).then((res) => {
        this.liked.songs = res.ids
      })
    },

    async fetchPlayHistory () {
      if (!isAccountLogin()) return
      const resultArray = await Promise.all([
        userPlayHistory({ uid: this.user?.userId, type: 0 }),
        userPlayHistory({ uid: this.user?.userId, type: 1 }),
      ])
      const data = { allData: [], weekData: [] }
      const dataType = ['allData', 'weekData']
      if (resultArray.at(0) && resultArray.at(1)) {
        for (let i = 0; i < resultArray.length; i++) {
          const songData = resultArray.at(i)[dataType[i]].map((item) => {
            const song = item.song
            song.playCount = item.playCount
            return song
          })
          data[dataType[i]] = songData
        }
        this.liked.playHistory = data
      }
    },

    // 获取喜欢的全部歌曲详情信息
    fetchLikedSongsWithDetails () {
      getPlaylistDetail({ id: this.likedSongPlaylistID, noCache: true }).then((res) => {
        getTrackDetail(
          res.playlist.trackIds
            .slice(0, 12)
            .map((t: { id: number }) => t.id)
            .join(',')
        ).then((result) => {
          this.liked.songsWithDetails = result.songs
        })

        /*  map之后得到的的结果
        [
          1377807992, 1809358918, 1874051842, 1391891631, 1379958635, 1462956212,
          1493420414, 1846565957, 1848814609, 448143303, 1867217766, 1871205712,
        ] */
      })
    },

    fetchLikedAlbums () {
      if (!isAccountLogin()) return
      likedAlbums({ limit: 2000 }).then((result) => {
        this.liked.albums = result.data
      })
    },

    // 获取喜欢的歌手、艺人
    fetchLikedArtists () {
      if (!isAccountLogin()) return
      likedArtists({ limit: 2000 }).then((result) => {
        if (result.data) {
          this.liked.artists = result.data
        }
      })
    },

    async fetchLikedMVs () {
      if (!isAccountLogin()) return
      await likedMVs({ limit: 1000 }).then((result) => {
        this.liked.mvs = result.data
      })
    },

    async fetchCloudDisk () {
      if (!isAccountLogin()) return
      await cloudDisk({ limit: 1000 }).then((result) => {
        this.liked.cloudDisk = result.data
      })
    },

    // 将歌曲加入喜欢队列或者移除喜欢队列
    loveATrck (id: number) {
      const storeToast = toastStore()
      if (!isAccountLogin()) {
        storeToast.showToast('此操作需要登录网易云账号')
        return
      }
      let like = true
      if (this.liked.songs.includes(id)) like = false
      likeATrack({ id, like })
        .then(() => {
          if (!like) {
            this.liked.songs = this.liked.songs.filter((d) => d !== id)
          } else {
            const newLikeSongs = this.liked.songs
            newLikeSongs.push(id)
            this.liked.songs = newLikeSongs
          }
          this.fetchLikedSongsWithDetails()
        })
        .catch(() => {
          storeToast.showToast('操作失败，专辑下架或版权锁定')
        })
    },
  },
})
