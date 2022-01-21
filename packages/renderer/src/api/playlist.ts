import request from '../utils/request'

/**
 * 获取歌单详情
 * 说明 : 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可以获取对应歌单内的所有的音乐(未登录状态只能获取不完整的歌单,登录后是完整的)，
 * 但是返回的trackIds是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 song/detail 接口
 * 获取所有歌曲的详情 (https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452)
 * - id : 歌单 id
 * - s : 歌单最近的 s 个收藏者, 默认为8

 */

interface ListDetailParams {
  id: number
  noCache?: boolean
  timestamp?: number
}
type GetPlaylistDetail = (params: ListDetailParams) => Promise<any>
export const getPlaylistDetail: GetPlaylistDetail = async (params) => {
  return request({
    url: '/playlist/detail',
    method: 'get',
    params: {
      id: params.id,
      noCache: params.noCache,
      timeStamp: Date.now(),
    },
  })
}
