import { Howl, Howler } from 'howler'
import shuffle from 'lodash/shuffle'

import { lastfmStore } from '../store/lastfmStore'
import { playerStore } from '../store/playerStore'

import { getAlbum } from '@/api/album'
import { trackScrobble } from '@/api/lastfm'
import { getMP3, getTrackDetail, scrobble } from '@/api/track'
import { userDataStore } from '@/store/userData'

const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

class Player {
  _playing: boolean
  _progress: number
  _enabled: boolean
  _repeatMode: string
  _shuffle: boolean
  _volumeBeforeMuted: number
  _volume: number
  _list: number[]
  _current: number
  _shuffledList: number[]
  _playlistSource: { type: string; id: number }
  _currentTrack: { id: number; dt: number; name: string }
  _playNextList: never[]
  _personalFMTrack: { id: number }
  _personalFMNextTrack: { id: number }
  _howler: null
  _isPersonalFM: boolean
  createdBlobRecords: string[]
  _reversed: boolean
  _shuffledCurrent: number
  constructor () {
    const playerState = playerStore()
    this._playing = playerState.playing // 是否正在播放
    this._progress = playerState.progress // 当前播放歌曲的进度
    this._enabled = playerState.enabled // 是否启用Player
    this._repeatMode = playerState.repeatMode // off| on | one 循环模式，one表示单曲循环
    this._shuffle = playerState.shuffle // 是否开启随机播放
    this._volume = playerState.volume // 0-1音量
    this._volumeBeforeMuted = playerState.volumeBeforeMuted // 用于保存静音前的音量
    this._reversed = playerState.reversed

    // 播放信息
    this._list = playerState.list // 播放列表,为歌曲id数组
    this._current = playerState.current // 当前播放歌曲在播放列表里的index
    this._shuffledList = playerState.shuffledList // 被随机打乱的播放列表，随机播放模式下使用此播放列表
    this._shuffledCurrent = playerState.shuffledCurrent // 当前播放歌曲在随机列表里面的index
    this._playlistSource = playerState.playlistSource // 当前播放列表的信息
    this._currentTrack = playerState.currentTrack // 当前播放歌曲的详细信息
    this._playNextList = playerState.playNextList // 当这个list不为空时，会优先播放这个list的歌
    this._isPersonalFM = playerState.isPersonalFM // 是否开启私人FM模式
    this._personalFMTrack = playerState.personalFMNextTrack // 私人FM当前歌曲
    this._personalFMNextTrack = playerState.personalFMNextTrack // 私人FM下一首

    /**
     * The blob records for cleanup.
     *
     * @private
     * @type {string[]}
     */
    this.createdBlobRecords = playerState.createdBlobRecords
    /**
 @see https://github.com/goldfire/howler.js#examples
  */
    this._howler = null
    Object.defineProperty(this, '_howler', {
      enumerable: false,
    })

    // 初始化
    this._init()

    // window.vmplayermusic = {}
    // window.vmplayermusic.player = this
  }

  _init () {
    console.log('待写')
  }

  get repeatMode () {
    return this._repeatMode
  }

  set repeatMode (mode) {
    if (this._isPersonalFM) return
    if (!['on', 'off', 'one'].includes(mode)) {
      console.warn("repeatMOde: invalid args,must be 'on' | 'off' | 'one' ")
    } else {
      this._repeatMode = mode
    }
  }

  get shuffle () {
    return this._shuffle
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  set shuffle (shuffle: boolean) {
    if (this._isPersonalFM) return
    if (!shuffle && shuffle) {
      console.warn('shuffle: invalid args, must be Boolean')
    } else {
      this._shuffle = shuffle
      // 待写
    }
  }

  get reversed () {
    return this._reversed
  }

  set reversed (reversed) {
    if (this._isPersonalFM) return
    if (!reversed && reversed) {
      console.warn('reversed: invalid args, must be Boolean')
      return
    }
    console.log('changing reversed to:', reversed)
    this._reversed = reversed
  }

  get volume () {
    return this._volume
  }

  set volume (volume) {
    this._volume = volume
    Howler.volume(volume)
  }

  get list () {
    return this.shuffle ? this._shuffledList : this._list
  }

  set list (list) {
    this._list = list
  }

  get current () {
    return this.shuffle ? this._shuffledCurrent : this._current
  }

  set current (current) {
    if (this.shuffle) {
      this._shuffledCurrent = current
    } else {
      this._current = current
    }
  }

  get enabled () {
    return this._enabled
  }

  get playing () {
    return this._playing
  }

  get currentTrack () {
    return this._currentTrack
  }

  get playlistSource () {
    return this._playlistSource
  }

  get playNextList () {
    return this._playNextList
  }

  get isPersonalFM () {
    return this._isPersonalFM
  }

  get personalFMTrack () {
    return this._personalFMTrack
  }

  get currentTrackDuration () {
    const trackDuration = this._currentTrack.dt || 1000
    const duration = ~~(trackDuration / 1000)
    return duration > 1 ? duration - 1 : duration
  }

  get progress () {
    return this._progress
  }

  set progress (value) {
    if (this._howler) {
      this._howler.seek(value)
    }
  }

  get isCurrentTrackLiked () {
    const store = userDataStore()
    const likedSongs = store.liked.songs
    return likedSongs.includes(this.currentTrack.id)
  }

  // 随机播放列表歌曲, 0表示默认选中第一首歌
  _shuffleTheList (firstTrackID = this._currentTrack.id || 0) {
    let list = this._list.filter((tid) => tid !== firstTrackID)
    if (firstTrackID === 0) list = this._list
    // shuffle是loadash里面用来生成随机数组的方法
    this._shuffledList = shuffle(list)
    if (firstTrackID !== 0) this._shuffledList.unshift(firstTrackID)
  }

  _scrobble (
    track: { id: number; dt: any; name: any; ar?: any; al?: any; no?: any },
    time: number,
    completed = false
  ) {
    console.debug(
      `[debug][Player.js] scrobble track 👉 ${track.name} by ${track.ar[0].name} 👉 time:${time} completed: ${completed}`
    )
    const trackDuration = ~~(track.dt / 1000)
    time = completed ? trackDuration : ~~time
    scrobble({
      id: track.id,
      sourceid: this.playlistSource.id,
      time,
    })
    const store = lastfmStore()
    if (store.key !== undefined && (time >= trackDuration / 2 || time >= 240)) {
      const timestamp = ~~(Date.now() / 1000) - time
      trackScrobble({
        artist: track.ar[0].name,
        track: track.name,
        timestamp,
        album: track.al.name,
        trackNumber: track.no,
        duration: trackDuration,
      })
    }
  }

  _replaceCurrentTrack (id: number, autoPlay = true, ifUnplayableThen = 'playNext') {
    if (autoPlay && this._currentTrack.name) {
      this._scrobble(this.currentTrack, this._howler?.seek())
    }
  }

  sendSelfToIpcMain () {
    const store = userDataStore()
    const likedSongs = store.liked.songs
    ipcRenderer.send('player', {
      playing: this.playing,
      likedCurrentTrack: likedSongs.includes(this._currentTrack.id),
    })
  }

  saveSelfToLocalStorage () {
    const player: { [x: string]: any } = {}
    for (const [key, value] of Object.entries(this)) {
      if (key === '_playing') continue
      player[key] = value
    }
    localStorage.setItem('player', JSON.stringify(player))
  }

  playPlaylistByID (id: number, trackID = 0, noCache = false) {
    console.debug(
      `[debug][Player.js] playPlaylistByID 👉 id:${id} trackID:${trackID} noCache:${noCache}`
    )
  }

  playAlbumByID (id: number, trackID = 0) {
    getAlbum({ id }).then((data) => {
      const trackIDs = data.songs.map((t: { id: any }) => t.id)
      this.replacePlaylist(trackIDs, id, 'album', trackID)
    })
  }

  playTrackOnListByID (id: number, listName = 'default') {
    if (listName === 'default') {
      this._current = this._list.indexOf(id)
    }
    this._replaceCurrentTrack(id)
  }

  replacePlaylist (
    trackIDs: number[],
    playlistSourceID: number,
    playlistSourceType: string,
    autoPlayTrackID = 0
  ) {
    this._isPersonalFM = false
    if (!this._enabled) this._enabled = true
    this.list = trackIDs
    this.current = 0
    this._playlistSource = {
      type: playlistSourceType,
      id: playlistSourceID,
    }
    if (this.shuffle) this._shuffleTheList(autoPlayTrackID)
    if (autoPlayTrackID === 0) {
      this._replaceCurrentTrack(this.list[0])
    } else {
      this.current = trackIDs.indexOf(autoPlayTrackID)
      this._replaceCurrentTrack(autoPlayTrackID)
    }
  }

  // seek (time = null) {
  //   if (time !== null) {
  //     this._howler?.seek(time)
  //     if (this._playing) this._playDiscordPresence(this._currentTrack, this.seek())
  //   }
  //   return this._howler === null ? 0 : this._howler.seek()
  // }
}

let player = new Player()
player = new Proxy(player, {
  set (target, prop, val) {
    target[prop] = val
    if (prop === '_howler') return true
    target.saveSelfToLocalStorage()
    target.sendSelfToIpcMain()
    return true
  },
})

export default player
