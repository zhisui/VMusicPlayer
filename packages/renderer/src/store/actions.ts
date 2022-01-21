import { getPlaylistDetail } from '/@/api/playlist'
import { getTrackDetail } from '/@/api/track'
import {
  likedAlbums,
  likedArtists,
  likedMVs,
  userAccount,
  userLikedSongsIDs,
  userPlaylist,
} from '/@/api/user'
import { isAccountLogin } from '/@/utils/auth'
import { mapTrackPlayableStatus } from '/@/utils/common'

export default {
  // 获取用户信息，更新data中的user
  fetchUserProfile ({ commit }) {
    if (!isAccountLogin()) return
    userAccount().then((res) => {
      if (res.code === 200) {
        commit('updateData', { key: 'user', value: res.profile })
      }
    })
  },

  // 获取喜欢的歌单,更新liked和data中的likedSongPlaylistID
  fetchLikedPlaylist ({ state, commit }) {
    if (!isAccountLogin()) return
    return userPlaylist({
      uid: state.data.user?.userId,
      limit: 1000,
    })
    // .then((res) => {
    //   if (res.playlist) {
    //     commit('updateLikedXXX', {
    //       name: 'playlists',
    //       data: res.playlist,
    //     })
    //     commit('updateData', {
    //       key: 'likedSongPlaylistID',
    //       value: res.playlist[0].id,
    //     })
    //   }
    // })
  },

  // 获取喜欢的所有歌曲id
  fetchLikedSongsIDs ({ state, commit }) {
    if (!isAccountLogin()) return
    return userLikedSongsIDs({ uid: state.data.user.userId }).then((res) => {
      if (res.ids) {
        commit('updateLikedXXX', {
          name: 'songs',
          data: res.ids,
        })
      }
    })
  },

  // 获取喜欢的歌曲详情信息
  fetchLikedSongsWithDetails ({ state, commit }) {
    console.log(state.data.likedSongPlaylistID)
    return getPlaylistDetail({ id: state.data.likedSongPlaylistID, noCache: true }).then(
      (res) => {
        console.log(res)

        if (res.playlist) {
          res.playlist.tracks = mapTrackPlayableStatus(res.playlist.tracks, res.privileges)
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
          console.log(result)

          commit('updateLikedXXX', {
            name: 'songsWithDetails',
            data: result.songs,
          })
        })
      }
    )
  },

  fetchLikedAlbums ({ commit }) {
    if (!isAccountLogin()) return
    return likedAlbums({ limit: 2000 }).then((result) => {
      if (result.data) {
        commit('updateLikedXXX', {
          name: 'albums',
          data: result.data,
        })
      }
    })
  },
  // 获取喜欢的歌手、艺人
  fetchLikedArtists ({ commit }) {
    if (!isAccountLogin()) return
    return likedArtists({ limit: 2000 }).then((result) => {
      if (result.data) {
        commit('updateLikedXXX', {
          name: 'artists',
          data: result.data,
        })
      }
    })
  },
  fetchLikedMVs ({ commit }) {
    if (!isAccountLogin()) return
    return likedMVs({ limit: 1000 }).then((result) => {
      if (result.data) {
        commit('updateLikedXXX', {
          name: 'mvs',
          data: result.data,
        })
      }
    })
  },
}
