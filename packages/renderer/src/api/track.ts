import { settingStore } from '../store/settingStore'
import { mapTrackPlayableStatus } from '../utils/common'
import { db } from '../utils/db'

import request from '@/utils/request'

interface Ids {
  ids: string
}
type GetSongDetail = (params: Ids) => Promise<any>
export const getSongDetail: GetSongDetail = (params) => {
  return request({
    url: '/song/detail',
    method: 'get',
    params: {
      ids: params.ids,
    },
  })
}

export const getTrackDetail = async (ids: string) => {
  const fetchLatest = async () => {
    return getSongDetail({ ids }).then((data) => {
      data.songs.forEach((song: { id: number }) => {
        const privileges = data.privileges.find(
          (privilege: { id: number }) => privilege.id === song.id
        )
        db.cacheTrackDetail(song, privileges)
      })
      data.songs = mapTrackPlayableStatus(data.songs, data.privileges)
      return data
    })
  }

  fetchLatest()
  let idsInArray = [String(ids)]
  if (typeof ids === 'string') {
    idsInArray = ids.split(',')
  }

  return db.getTrackDetailFromCache(idsInArray).then(async (result) => {
    if (result) {
      result.songs = mapTrackPlayableStatus(result.songs, result.privileges)
    }
    return result ?? fetchLatest()
  })
}

/**
 * 获取歌词
 * 说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
 */
export const getLyric = async (id: number) => {
  const fetchLatest = () => {
    return request({
      url: '/lyric',
      method: 'get',
      params: {
        id,
      },
    }).then((res) => {
      db.cacheLyric(id, res)
      return res
    })
  }
  fetchLatest()
  return db.getLyricFromCache(id).then((result) => {
    return result ?? fetchLatest()
  })
}

/**
 * 获取音乐 url
 * 说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,
 * !!!未登录状态返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
 * @param {string} id - 音乐的 id，例如 id=405998841,33894312
 */
interface GetMP3Params {
  id: number
  br?: number
}
type GetMP3 = (params: GetMP3Params) => Promise<any>
export const getMP3: GetMP3 = (params) => {
  const store = settingStore()
  const br = store?.musicQuality !== undefined ? store.musicQuality : 320000
  return request({
    url: '/song/url',
    method: 'get',
    params: {
      id: params.id,
      br: br,
    },
  })
}

/**
 * 听歌打卡
 * 说明 : 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据
 * - id - 歌曲 id
 * - sourceid - 歌单或专辑 id
 * - time - 歌曲播放时间,单位为秒
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.sourceid
 * @param {number=} params.time
 */
interface ScrobbleParams {
  id: number
  sourceid: number
  time: number
  timestamp?: number
}
type Scrobble = (params: ScrobbleParams) => Promise<any>
export const scrobble: Scrobble = (params) => {
  params.timestamp = Date.now()
  return request({
    url: '/scrobble',
    method: 'get',
    params,
  })
}

/**
 * 喜欢音乐
 * 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 * - id - 歌曲 id
 * - like - 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 * @param {Object} params
 * @param {number} params.id
 * @param {boolean=} [params.like]
 */

interface LikeATrackParams {
  id: number
  like: boolean
  timestamp?: number
}
type LikeATrack = (params: LikeATrackParams) => Promise<any>
export const likeATrack: LikeATrack = (params) => {
  params.timestamp = Date.now()
  return request({
    url: '/like',
    method: 'get',
    params,
  })
}
