import axios from 'axios'
import md5 from 'crypto-js/md5'

import { lastfmStore } from '../store/lastfmStore'

const apiKey = process.env.VUE_APP_LASTFM_API_KEY
const apiSharedSecret = process.env.VUE_APP_LASTFM_API_SHARED_SECRET
const baseUrl = window.location.origin
const url = 'https://ws.audioscrobbler.com/2.0/'

// 生成签名
const sign = (params: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  const sortParamsKeys = Object.keys(params).sort()
  const sortedParams = sortParamsKeys.reduce((acc, key) => {
    acc[key] = params[key]
    return acc
  }, {})
  let signature = ''
  for (const [key, value] of Object.entries(sortedParams)) {
    signature += `${key}${value}`
  }
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return md5(signature + apiSharedSecret).toString()
}

// https://www.last.fm/api/show/track.updateNowPlaying 告诉lastfm开始播放音乐了
export async function trackUpdateNowPlaying (params: any) {
  params.api_key = apiKey
  params.method = 'track.updateNowPlaying'
  // sk为通过身份验证协议对用户进行身份验证而生成的会话密钥
  params.sk = JSON.parse(localStorage.getItem('lastfm')).key
  const signature = sign(params)

  return axios({
    url,
    method: 'POST',
    params: {
      ...params,
      api_sig: signature,
      format: 'json',
    },
  })
}

/** 猜测是获取同一歌手相关的歌曲 @see https://www.last.fm/api/show/track.scrobble */
export const trackScrobble = async (params: { [x: string]: any }) => {
  params.api_key = apiKey
  params.method = 'track.scrobble'
  const store = lastfmStore()
  params.sk = JSON.parse(localStorage.getItem('lastfm')).key
  const signature = sign(params)

  return axios({
    url,
    method: 'POST',
    params: {
      ...params,
      api_sig: signature,
      format: 'json',
    },
  })
}
