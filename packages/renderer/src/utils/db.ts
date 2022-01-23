import Dexie, { Table } from 'dexie'

import { getTrackDetail } from '@/api/track'

export interface Common {
  id?: number
  updateTime: number
}

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

export class VmPlayerMusic extends Dexie {
  trackDetail!: Table<TrackDetail>
  lyric!: Table<Lyric>
  album!: Table<Common>
  trackSources!: Table<Common>

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

  cacheTrackDetail (track: any, privileges: any[]) {
    db.trackDetail.put({
      id: track.id,
      detail: track,
      privileges: privileges,
      updateTime: Date.now(),
    })
  }

  // 传入所有歌曲的trackid，然后从数据库中删选出所有符书的detail和privileges
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

  // 歌词存取
  cacheLyric (id: number, lyrics: any) {
    db.lyric.put({
      id,
      lyrics,
      updateTime: Date.now(),
    })
  }

  async getLyricFromCache (id: number) {
    return db.lyric.get(Number(id)).then((res) => {
      if (!res) return undefined
      return res.lyrics
    })
  }
}

export const db = new VmPlayerMusic()
