import { userPlaylist } from './../api/user'
import initLocalStorage from './initLocalStorage'

if (localStorage.getItem('data') === null) {
  localStorage.setItem('data', JSON.stringify(initLocalStorage.data))
}

if (localStorage.getItem('setting') === null) {
  localStorage.setItem('seeting', JSON.stringify(initLocalStorage.setting))
}

export interface State {
  liked: {
    songs: number[]
    playlists: any[]
    albums: any[]
    artists: any[]
    mvs: any[]
    songsWithDetails: any[]
  }
  enableScrolling: boolean
  data: unknown
  setting: unknown
  player: unknown
}

export const state: State = {
  liked: {
    songs: [],
    playlists: [],
    albums: [],
    artists: [],
    mvs: [],
    songsWithDetails: [],
  },
  enableScrolling: true,
  data: JSON.parse(localStorage.getItem('data')!),
  setting: JSON.parse(localStorage.getItem('setting')!),
  player: JSON.parse(localStorage.getItem('player')!),
}
