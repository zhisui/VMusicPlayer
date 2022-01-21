import { userPlaylist } from './../api/user'
import initLocalStorage from './initLocalStorage'

if (localStorage.getItem('data') === null) {
  localStorage.setItem('data', JSON.stringify(initLocalStorage.data))
}

if (localStorage.getItem('setting') === null) {
  localStorage.setItem('seeting', JSON.stringify(initLocalStorage.setting))
}

export default {
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
