import request from '../utils/request'
/* 获取用户账号信息
说明 : 登录后调用此接口 ,可获取用户账号信息
 */

export const userAccount = async () => {
  return request({
    url: '/user/account',
    method: 'get',
    params: {
      timestamp: Date.now(),
    },
  })
}

/* 获取用户歌单
说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户歌单
必选参数 : uid : 用户 id
可选参数 :
limit : 返回数量 , 默认为 30
offset : 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 */
interface UserPlaylistParams {
  uid: number
  limit?: number
  offset?: number
}
type UserPlayList = (params: UserPlaylistParams) => Promise<any>
export const userPlaylist: UserPlayList = async (params: UserPlaylistParams) => {
  return request({
    url: '/user/playlist',
    method: 'get',
    params: params,
  })
}

/**
 * 获取用户播放记录
 * 说明 : 登录后调用此接口 , 传入用户 id, 可获取用户播放记录
 * - uid : 用户 id
 * - type : type=1 时只返回 weekData, type=0 时返回 allData
 * @param {Object} params
 * @param {number} params.uid
 * @param {number} params.type
 */

interface UserPlayHistoryParams {
  uid: number
  type: number
}
type UserPlayHistory = (params: UserPlayHistoryParams) => Promise<any>
export const userPlayHistory: UserPlayHistory = async (params) => {
  return request({
    url: '/user/record',
    method: 'get',
    params,
  })
}

/**
 * 喜欢音乐列表（需要登录）
 * 说明 : 调用此接口 , 传入用户 id, 可获取已喜欢音乐id列表(id数组)
 * - uid: 用户 id
 */
interface LikedSongsIDs {
  uid: number
  timestamp?: number
}
type UserLikedSongsIDs = (params: LikedSongsIDs) => Promise<any>
export const userLikedSongsIDs: UserLikedSongsIDs = async (params) => {
  return request({
    url: '/likelist',
    method: 'get',
    params: params,
  })
}

/**
 * 获取收藏的专辑（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的专辑
 * - limit : 返回数量 , 默认为 25
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*25, 其中 25 为 limit 的值 , 默认为 0
 */
interface LikedAlbumsParams {
  limit: number
  offset?: number
  timestamp?: number
}

type LikedAlbums = (params: LikedAlbumsParams) => Promise<any>
export const likedAlbums: LikedAlbums = async (params) => {
  return request({
    url: '/album/sublist',
    method: 'get',
    params: params,
  })
}

/**
 * 获取收藏的歌手（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的歌手
 */
interface Artistsparams {
  limit: number
  timestamp?: number
}
type LikedArtists = (params: Artistsparams) => Promise<any>

export const likedArtists: LikedArtists = async (params) => {
  return request({
    url: '/artist/sublist',
    method: 'get',
    params: {
      limit: params.limit,
      timestamp: Date.now(),
    },
  })
}

/**
 * 获取收藏的MV（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的MV
 */
interface MVsparams {
  limit: number
  timestamp?: number
}
type LikedMVs = (params: MVsparams) => Promise<any>

export const likedMVs: LikedMVs = async (params) => {
  return request({
    url: '/mv/sublist',
    method: 'get',
    params: {
      limit: params.limit,
      timestamp: Date.now(),
    },
  })
}

/**
 * 上传歌曲到云盘（需要登录）
 */
export const uploadSong = async (file: string | Blob) => {
  const formData = new FormData()
  formData.append('songFile', file)
  return request({
    url: '/cloud',
    method: 'post',
    params: {
      timestamp: Date.now(),
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 200000,
  }).catch((err) => {
    alert(`上传失败，Error: ${err}`)
  })
}

/**
 * 获取云盘歌曲（需要登录）
 * 说明 : 登录后调用此接口 , 可获取云盘数据 , 获取的数据没有对应 url, 需要再调用一 次 /song/url 获取 url
 * - limit : 返回数量 , 默认为 200
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*200, 其中 200 为 limit 的值 , 默认为 0
 */

interface CloudDiskParams {
  limit: number
  offset?: number
  timestamp?: number
}
type CloudDisk = (params: CloudDiskParams) => Promise<any>
export const cloudDisk: CloudDisk = async (params) => {
  params.timestamp = Date.now()
  const res = await request({
    url: '/user/cloud',
    method: 'get',
    params,
  })
  return res
}

/**
 * 获取云盘歌曲详情（需要登录）
 */
interface CloudTrackDetailParams {
  id: string
  timestamp?: number
}
type CloudDiskTrackDetail = (params: CloudTrackDetailParams) => Promise<any>
export const cloudDiskTrackDetail: CloudDiskTrackDetail = async (params) => {
  const res = await request({
    url: '/user/cloud/detail',
    method: 'get',
    params: {
      timestamp: Date.now(),
      id: params.id,
    },
  })
  return res
}

/**
 * 删除云盘歌曲（需要登录）
 */
interface CloudTrackDeleteParams {
  id: string
  timestamp?: number
}
type CloudTrackDelete = (params: CloudTrackDeleteParams) => Promise<any>
export const cloudDiskTrackDelete: CloudTrackDelete = async (params) => {
  const res = await request({
    url: '/user/cloud/del',
    method: 'get',
    params: {
      timestamp: Date.now(),
      id: params.id,
    },
  })
  return res
}
