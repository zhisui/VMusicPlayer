import store from '../store'
import { mapTrackPlayableStatus } from '../utils/common'
import { db } from '../utils/db'

import request from '/@/utils/request'

export const getTrackDetail = async (ids: string) => {
  const fetchLatest = () => {
    return request({
      url: '/song/detail',
      method: 'get',
      params: { ids },
    }).then((data) => {
      data.songs.forEach((song) => {
        const privileges = data.privileges.find((privilege) => privilege.id === song.id)
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

  return db.getTrackDetailFromCache(idsInArray).then((result) => {
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
