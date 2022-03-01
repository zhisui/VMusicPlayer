import { mapTrackPlayableStatus } from '@/utils/common'
import { db } from '@/utils/db'
import request from '@/utils/request'
/**
 * 获取专辑内容
 * 说明 : 调用此接口 , 传入专辑 id, 可获得专辑内容
 */
interface Id {
  id: number
}
type GetAlbum = (id: Id) => Promise<any>
export const getAlbum: GetAlbum = (params) => {
  const fetchLatest = () => {
    return request({
      url: '/album',
      method: 'get',
      params: params,
    }).then((data) => {
      db.cacheAlbum(params.id, data)
      data.songs = mapTrackPlayableStatus(data.songs, [])
      console.log(data)

      return data
    })
  }
  fetchLatest()

  return db.getAlbumFromCache(params.id).then((res) => {
    return res ?? fetchLatest()
  })
}

/**
 * 全部新碟
 * 说明 : 登录后调用此接口 ,可获取全部新碟
 * - limit - 返回数量 , 默认为 30
 * - offset - 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 * - area - ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
 * @param {Object} params
 * @param {number} params.limit
 * @param {number=} params.offset
 * @param {string} params.area
 */
type NewAlbumsParams = {
  limit?: number
  offset?: number
  area?: string
}
export const newAlbums = (params: NewAlbumsParams) => {
  return request({
    url: '/album/new',
    method: 'get',
    params,
  })
}

/**
 * 收藏/取消收藏专辑
 * 说明 : 调用此接口,可收藏/取消收藏专辑
 * - id - 返专辑 id
 * - t - 1 为收藏,其他为取消收藏
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.t
 */
interface LikeAAlbumParams {
  id: number
  t: number
}
export const likeAAlbum = (params: LikeAAlbumParams) => {
  return request({
    url: '/album/sub',
    method: 'post',
    params,
  })
}

/**
 * 专辑动态信息
 * 说明 : 调用此接口 , 传入专辑 id, 可获得专辑动态信息,如是否收藏,收藏数,评论数,分享数
 * - id - 专辑id
 * @param {number} id
 */
export const albumDynamicDetail = (id: number) => {
  return request({
    url: '/album/detail/dynamic',
    method: 'get',
    params: { id, timestamp: Date.now() },
  })
}
