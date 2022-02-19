import axios from 'axios'
import Dexie, { Table } from 'dexie'

import { settingStore } from '../store/settingStore'

import { getTrackDetail } from '@/api/track'
export interface TrackDetail {
  id: number
  detail: any
  privileges?: any[]
  updateTime?: number
}

export interface Lyric {
  id: number
  lyrics: any
  updateTime: number
}

export interface Album {
  id: number
  album: any
  updateTime: number
}

export interface TrackSources {
  id: number
  source: any
  name: string
  bitRate: any
  from: any
  artist: any
  createTime: number
}

/**
@see https://dexie.org/docs/Tutorial/Getting-started
*/
export class VmPlayerMusic extends Dexie {
  trackDetail!: Table<TrackDetail>
  lyric!: Table<Lyric>
  album!: Table<Album>
  trackSources!: Table<TrackSources>

  constructor () {
    super('vmPlayerMusic')
    this.version(4).stores({
      trackDetail: '++id, updateTime',
      lyric: '++id, updateTime',
      album: '++id, updateTime',
    })

    this.version(3)
      .stores({
        trackSources: '++id, createTime',
      })
      .upgrade(async (tx) =>
        tx
          .table('trackSources')
          .toCollection()
          .modify((track) => !track.createTime && (track.createTime = Date.now()))
      )
  }

  async deleteExcessCache (tracksCacheBytes: number) {
    const store = settingStore()
    if (
      store.cacheLimit === false ||
      tracksCacheBytes < store.cacheLimit * Math.pow(1024, 2)
    ) {
      return
    }
    try {
      const delCache = await db.trackSources.orderBy('createTime').first()
      if (delCache) {
        await db.trackSources.delete(delCache.id)
        tracksCacheBytes -= delCache.source.byteLength
        console.debug(
          `[debug][db.js] deleteExcessCacheSucces, track: ${delCache.name}, size: ${delCache.source.byteLength}, cacheSize:${tracksCacheBytes}`
        )
        this.deleteExcessCache(tracksCacheBytes)
      }
    } catch (err) {
      console.debug('[debug][db.js] deleteExcessCacheFailed', err)
    }
  }

  cacheTrackSource (
    trackInfo: {
      name: any
      ar: { name: any }[]
      artists: { name: any }[]
      al: { picUrl: any }
      id: number
    },
    // url为歌曲的在线播放地址
    url: string,
    bitRate: number,
    from = 'netease'
  ) {
    let tracksCacheBytes = 0
    if (!process.env.IS_ELECTRON) return
    const name = trackInfo.name
    const artist =
      (trackInfo.ar && trackInfo.ar[0]?.name) ||
      (trackInfo.artists && trackInfo.artists[0]?.name) ||
      'Unknown'
    let cover = trackInfo.al.picUrl
    if (cover.slice(0, 5) !== 'https') {
      cover = 'https' + String(cover.slice(4))
    }
    axios.get(`${cover}?param=512y512`)
    axios.get(`${cover}?param=224y224`)
    axios.get(`${cover}?param=1024y1024`)
    return axios
      .get(url, {
        responseType: 'arraybuffer',
      })
      .then((response) => {
        db.trackSources.put({
          id: trackInfo.id,
          source: response.data,
          bitRate,
          from,
          name,
          artist,
          createTime: Date.now(),
        })
        console.debug(`[debug][db.js] cached track 👉 ${name} by ${artist}`)
        tracksCacheBytes += response.data.byteLength
        this.deleteExcessCache(tracksCacheBytes)
        return { trackID: trackInfo.id, source: response.data, bitRate }
      })
  }

  async getTrackSource (id: number) {
    return db.trackSources.get(Number(id)).then((track) => {
      if (!track) return null
      console.debug(
        `[debug][db.js] get track from cache 👉 ${track.name} by ${track.artist}`
      )
      return track
    })
  }

  cacheTrackDetail (track: any, privileges: any[]) {
    db.trackDetail.put({
      id: track.id,
      detail: track,
      privileges: privileges,
      updateTime: Date.now(),
    })
  }

  // 传入所有歌曲的trackid，然后从数据库中删选出所有符合的detail和privileges
  async getTrackDetailFromCache (ids: string[]) {
    return db.trackDetail
      .filter((track) => {
        return ids.includes(String(track.id))
      })
      .toArray()
      .then((tracks) => {
        type Songs = any[]
        const songs: Songs = []
        type Privileges = any[]
        const privileges: Privileges = []
        const result = { songs, privileges }
        ids.map((id) => {
          const one = tracks.find((t) => String(t.id) === id)
          result.songs.push(one?.detail)
          result.privileges.push(one?.privileges)
          if (result.songs.includes(undefined)) {
            return undefined
          }
          return result
        })
      })
  }

  cacheLyric (id: number, lyrics: any) {
    db.lyric.put({
      id,
      lyrics,
      updateTime: Date.now(),
    })
  }

  async getLyricFromCache (id: number) {
    return db.lyric.get(Number(id)).then((result) => {
      if (!result) return undefined
      return result.lyrics
    })
  }

  cacheAlbum (id: number, album: any) {
    db.album.put({
      id: Number(id),
      album,
      updateTime: Date.now(),
    })
  }

  async getAlbumFromCache (id: number) {
    return db.album.get(Number(id)).then((res) => {
      if (!res) return undefined
      return res.album
    })
  }
}

export const db = new VmPlayerMusic()
