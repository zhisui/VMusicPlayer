import { userDataStore } from './../store/userData'

const store = userDataStore()
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

export default class {
  _playering: boolean
  _progress: number
  _enabled: boolean
  _repeatMode: string
  _shuffle: boolean
  volume: number
  _volumeBeforeMuted: number
  _list: never[]
  _current: number
  _shuffledList: never[]
  _playlistSource: { type: string; id: number }
  _currentTrack: { id: number }
  _playNextList: never[]
  _personalFMTrack: { id: number }
  _personalFMNextTrack: { id: number }
  _howler: null
  _playing: any
  _isPersonalFM: boolean
  constructor () {
    this._playering = false // 是否正在播放
    this._progress = 0 // 当前播放歌曲的进度
    this._enabled = false // 是否启用Player
    this._repeatMode = 'off' // off| on | one 循环模式，one表示单曲循环
    this._shuffle = false // 是否开启随机播放
    this.volume = 1 // 0-1音量
    this._volumeBeforeMuted = 1 // 用于保存静音前的音量

    // 播放信息
    this._list = [] // 播放列表
    this._current = 0 // 当前播放歌曲在播放列表里的index
    this._shuffledList = [] // 被随机打乱的播放列表，随机播放模式下使用此播放列表
    this._playlistSource = { type: 'album', id: 123 } // 当前播放列表的信息
    this._currentTrack = { id: 86827685 } // 当前播放歌曲的详细信息
    this._playNextList = [] // 当这个list不为空时，会优先播放这个list的歌
    this._isPersonalFM = false // 是否开启私人FM模式
    this._personalFMTrack = { id: 0 } // 私人FM当前歌曲
    this._personalFMNextTrack = { id: 0 } // 私人FM下一首

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

  set shuffle (shuffle) {
    if (this._isPersonalFM) return
    if (!shuffle && shuffle) {
      console.warn('shuffle: invalid args, must be Boolean')
    } else {
      this._shuffle = shuffle
      // 待写
    }
  }

  get playing () {
    return this._playing
  }

  sendSelfToIpcMain () {
    ipcRenderer.send('player', {
      playing: this.playing,
      likedCurrentTrack: store.liked.songs.includes(this._currentTrack.id),
    })
  }

  saveSelfToLocalStorage () {
    const player = {}
    for (const [key, value] of Object.entries(this)) {
      if (key === '_playing') continue
      player[key] = value
    }

    localStorage.setItem('player', JSON.stringify(player))
  }
}
