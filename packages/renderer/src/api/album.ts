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
