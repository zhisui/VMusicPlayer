import { defineStore } from 'pinia'

import { getCookie } from '../utils/auth'

import { getPlaylistDetail } from '@/api/playlist'
import { getTrackDetail } from '@/api/track'
import {
  cloudDisk,
  likedAlbums,
  likedArtists,
  likedMVs,
  userLikedSongsIDs,
  userPlayHistory,
  userPlaylist,
} from '@/api/user'
import { mapTrackPlayableStatus } from '@/utils/common'

export const userDataStore = defineStore('userData', {
  state: () => ({
    user: { userId: 111 },
    likedSongPlaylistID: 0,
    lastRefreshCookieDate: 0,
    loginMode: '',
    liked: {
      playlists: [],
      songs: [],
      songsWithDetails: [],
      playHistory: [],
      artists: [],
      mvs: [],
      cloudDisk: [],
      albums: [],
    },
  }),

  actions: {
    fetchLikedPlaylist () {
      if (!isAccountLogin()) return
      userPlaylist({
        uid: this.user?.userId,
        limit: 1000,
      }).then((res) => {
        this.likedSongPlaylistID = res.playlist[0].id
        this.liked.playlists = res.playlist
      })
    },
    // 获取喜欢的所有歌曲id
    fetchLikedSongsIDs () {
      if (!isAccountLogin()) return
      userLikedSongsIDs({ uid: this.user?.userId }).then((res) => {
        this.liked.songs = res.ids
      })
    },

    fetchPlayHistory () {
      // if (!isAccountLogin()) return
      // const resultArray = Promise.all([
      //   userPlayHistory({ uid: this.user?.userId, type: 0 }),
      //   userPlayHistory({ uid: this.user?.userId, type: 1 }),
      // ])
      // console.log(resultArray)
      // const data = {}
      // const dataType = { 0: 'allData', 1: 'weekData' }
      // if (resultArray[0] && resultArray[1]) {
      //   for (let i = 0; i < resultArray.length; i++) {
      //     const songData = resultArray[i][dataType[i]].map((item) => {
      //       const song = item.song
      //       song.playCount = item.playCount
      //       return song
      //     })
      //     data[[dataType[i]]] = songData
      //   }
      //   this.liked.playHistory = data
      // }
    },

    // 获取喜欢的歌曲详情信息
    fetchLikedSongsWithDetails () {
      console.log(this.likedSongPlaylistID)
      return getPlaylistDetail({ id: this.likedSongPlaylistID, noCache: true }).then(
        (res) => {
          console.log(res)

          if (res.playlist) {
            res.playlist.tracks = mapTrackPlayableStatus(
              res.playlist.tracks,
              res.privileges
            )
            console.log(res)
          }
          /*  map之后得到的的结果
        [
          1377807992, 1809358918, 1874051842, 1391891631, 1379958635, 1462956212,
          1493420414, 1846565957, 1848814609, 448143303, 1867217766, 1871205712,
        ] */

          return getTrackDetail(
            res.playlist.trackIds
              .slice(0, 12)
              .map((t: { id: number }) => t.id)
              .join(',')
          ).then((result) => {
            this.liked.songsWithDetails = result.songs
          })
        }
      )
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

    fetchLikedMVs () {
      if (!isAccountLogin()) return
      likedMVs({ limit: 1000 }).then((result) => {
        this.liked.mvs = result.data
      })
    },

    fetchCloudDisk () {
      if (!isAccountLogin()) return
      cloudDisk({ limit: 1000 }).then((result) => {
        this.liked.cloudDisk = result.data
      })
    },
  },
})
const store = userDataStore()
export function isAccountLogin () {
  return getCookie('MUSIC_U') !== undefined && store.loginMode === 'account'
}
