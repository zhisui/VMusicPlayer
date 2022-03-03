import { likeATrack } from '../api/track'
import { toastStore } from '../store/toastStore'
import { userDataStore } from '../store/userData'
import { isAccountLogin } from './auth'

// 传入喜欢的歌曲信息可根据信息判断歌曲是否可以播放，不能播放的话原因是什么
export const isTrackPlayable = (track: {
  privilege: { cs: any; fee: number; st: number }
  fee: number
  noCopyrightRcmd: null | undefined
}) => {
  const store = userDataStore()
  const result = {
    playable: true,
    reason: '',
  }
  if (isAccountLogin() && track?.privilege?.cs) return result
  if (track.fee === 1 || track.privilege?.fee === 1) {
    if (isAccountLogin() && store.user.vipType === 11) {
      result.playable = true
    } else {
      result.playable = false
      result.reason = 'VIP Only'
    }
  } else if (track.noCopyrightRcmd !== null && track.noCopyrightRcmd !== undefined) {
    result.playable = false
    result.reason = '无版权'
  } else if (track.privilege?.st < 0 && isAccountLogin()) {
    result.playable = false
    result.reason = '已下架'
  }
  return result
}

// 对调用接口后返回的privileges数据和版权数据合并到tracks字段中
export const mapTrackPlayableStatus = (tracks: any[], privileges: any[]) => {
  if (tracks?.length === undefined) return
  return tracks.map((track) => {
    const privilege = privileges.find((pri) => pri.id === track.id)
    track.privilege = privilege
    const result = isTrackPlayable(track)
    track.playable = result.playable
    track.reason = result.reason
    return track
  })
}

export function randomNum (minNum: number, maxNum: number) {
  switch (arguments.length) {
    case 1:
      return Math.round(Math.random() * minNum + 1)
    case 2:
      return Math.round(Math.random() * (maxNum - minNum + 1) + minNum)
    default:
      return 0
  }
}

export const notError = <T extends any>(data: any): data is T => data.code === 200

export function splitAlbumTitle (title: string) {
  const keywords = [
    'Bonus Tracks Edition',
    'Complete Edition',
    'Deluxe Edition',
    'Deluxe Version',
    'Tour Edition',
  ]
  for (const keyword of keywords) {
    if (!title.includes(keyword)) continue
    return {
      title: title
        .replace(`(${keyword})`, '')
        .replace(`: ${keyword}`, '')
        .replace(`[${keyword}]`, '')
        .replace(`- ${keyword}`, '')
        .replace(`${keyword}`, ''),
      subtitle: keyword,
    }
  }
  return {
    title: title,
    subtitle: '',
  }
}

export function splitSoundtrackAlbumTitle (title: string) {
  const keywords = [
    'Music from the Original Motion Picture Score',
    'The Original Motion Picture Soundtrack',
    'Original MGM Motion Picture Soundtrack',
    'Complete Original Motion Picture Score',
    'Original Music From The Motion Picture',
    'Music From The Disney+ Original Movie',
    'Original Music From The Netflix Film',
    'Original Score to the Motion Picture',
    'Original Motion Picture Soundtrack',
    'Soundtrack from the Motion Picture',
    'Original Television Soundtrack',
    'Original Motion Picture Score',
    'Music From the Motion Picture',
    'Music From The Motion Picture',
    'Complete Motion Picture Score',
    'Music from the Motion Picture',
    'Original Videogame Soundtrack',
    'La Bande Originale du Film',
    'Music from the Miniseries',
    'Bande Originale du Film',
    'Die Original Filmmusik',
    'Original Soundtrack',
    'Complete Score',
    'Original Score',
  ]
  for (const keyword of keywords) {
    if (!title.includes(keyword)) continue
    return {
      title: title
        .replace(`(${keyword})`, '')
        .replace(`: ${keyword}`, '')
        .replace(`[${keyword}]`, '')
        .replace(`- ${keyword}`, '')
        .replace(`${keyword}`, ''),
      subtitle: keyword,
    }
  }
  return {
    title: title,
    subtitle: '',
  }
}
