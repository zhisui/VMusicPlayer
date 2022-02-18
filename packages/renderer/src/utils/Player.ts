/* eslint-disable no-await-in-loop */
import { Howl, Howler } from 'howler'
import shuffle from 'lodash/shuffle'

import { personalFM } from '../api/other'
import { lastfmStore } from '../store/lastfmStore'
import { playerStore } from '../store/playerStore'
import { settingStore } from '../store/settingStore'
import { toastStore } from '../store/toastStore'
import { db } from './db'
import { isCreateTray } from './platform'

import { getAlbum } from '@/api/album'
import { trackScrobble, trackUpdateNowPlaying } from '@/api/lastfm'
import { getMP3, getTrackDetail, scrobble } from '@/api/track'
import { userDataStore } from '@/store/userData'
import { isAccountLogin } from '@/utils/auth'

const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

const delay = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('')
    }, ms)
  })
const setTitle = (track: any) => {
  document.title = track
    ? `${track.name} · ${track.ar[0].name} - YesPlayMusic`
    : 'YesPlayMusic'
  if (isCreateTray) {
    ipcRenderer.send('updateTrayTooltip', document.title)
  }
}

function setTrayLikeState (isLiked: boolean) {
  if (isCreateTray) {
    ipcRenderer.send('updateTrayLikeState', isLiked)
  }
}
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
  _currentTrack: { id: number; dt: number; name: string; no: number; al: any; ar: any }
  _playNextList: number[]
  _personalFMTrack: { id: number }
  _personalFMNextTrack: { id: number }
  _howler: null
  _isPersonalFM: boolean
  createdBlobRecords: string[]
  _reversed: boolean
  _shuffledCurrent: number
  _personalFMNextLoading: boolean
  _personalFMLoading: boolean
  constructor () {
    const playerState = playerStore()
    this._playing = playerState.playing // 是否正在播放
    this._progress = playerState.progress // 当前播放歌曲的进度
    this._enabled = playerState.enabled // 是否启用Player
    this._repeatMode = playerState.repeatMode // off| on | one 循环模式，one表示单曲循环
    this._shuffle = playerState.shuffle // 是否开启随机播放
    this._volume = playerState.volume // 0-1音量
    this._volumeBeforeMuted = playerState.volumeBeforeMuted // 用于保存静音前的音量
    this._reversed = playerState.reversed // 是否为倒序播放
    this._personalFMLoading = playerState.personalFMLoading // 是否正在私人FM中加载新的track
    this._personalFMNextLoading = playerState.personalFMNextLoading // 是否正在缓存私人FM的下一首歌曲
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

  /** 手机播放音乐的时候可以设置锁屏或者通知栏上的效果
  @see https://juejin.cn/post/6844903605800009742
  */
  _updateMediaSessionMetaData (track: {
    ar: any[]
    name: string
    al: { name: string; picUrl: string }
  }) {
    if ('mediaSession' in navigator) {
      const artists = track.ar.map((a) => a.name)
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.name,
        artist: artists.join(','),
        album: track.al.name,
        artwork: [
          {
            src: track.al.picUrl + '?param=512y512',
            type: 'image/jpg',
            sizes: '512x512',
          },
        ],
      })
    }
  }

  _playAudioSource (source: string, autoPlay = true) {
    Howler.unload()
    this._howler = new Howl({
      src: [source],
      html5: true,
      format: ['mp3', 'flac'],
      onend: () => {
        this._nextTrackCallback()
      },
    })
    if (autoPlay) {
      this.play()
      if (this._currentTrack.name) {
        setTitle(this._currentTrack)
      }
      const store = userDataStore()
      setTrayLikeState(store.liked.songs.includes(this.currentTrack.id))
    }
    this.setOutputDevice()
  }

  _nextTrackCallback () {
    this._scrobble(this._currentTrack, 0, true)
    if (!this.isPersonalFM && this.repeatMode === 'one') {
      this._replaceCurrentTrack(this._currentTrack.id)
    } else if (this.isPersonalFM) {
      this.playNextFMTrack()
    } else {
      this.playNextTrack()
    }
  }

  _replaceCurrentTrack (id: number, autoPlay = true, ifUnplayableThen = 'playNext') {
    if (autoPlay && this._currentTrack.name) {
      this._scrobble(this.currentTrack, this._howler?.seek())
    }

    return getTrackDetail(id.toString()).then(async (data) => {
      const track = data.songs[0]
      this._updateMediaSessionMetaData(track)
      return this._getAudioSource(track).then((source) => {
        if (source) {
          this._playAudioSource(source, autoPlay)
          this._cacheNextTrack()
          return source
        }
        const store = toastStore()
        store.showToast(`无法播放 ${track.name}`)
        if (ifUnplayableThen === 'playNextTrack') {
          if (this.isPersonalFM) {
            this.playNextFMTrack()
          } else {
            this.playNextTrack()
          }
        } else {
          this.playPrevTrack()
        }
      })
    })
  }

  _cacheNextTrack () {
    const nextTrackID = this._isPersonalFM
      ? this._personalFMNextTrack?.id ?? 0
      : this._getNextTrack()[0]
    if (!nextTrackID) return
    if (this._personalFMTrack.id === nextTrackID) return
    getTrackDetail(nextTrackID.toString()).then((data) => {
      const track = data.songs[0]
      this._getAudioSource(track)
    })
  }

  async _getAudioSource (track: { id: number }) {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    return this._getAudioSourceFromCache(track.id)
      .then((source) => {
        source ?? this._getAudioSourceFromNetease(track)
      })
      .then(async (source) => {
        return source ?? this._getAudioSourceFromUnblockMusic(track)
      })
  }

  async _getAudioSourceFromCache (id: number) {
    return db.getTrackSource(id).then((t) => {
      if (!t) return null

      // URL.createObjectURL()方法会根据传入的参数创建一个指向该参数对象的URL,Blob对象，就是二进制数据。
      const source = URL.createObjectURL(new Blob([t.source]))
      /*
      每次调用createObjectURL时，即使你已经为同一个文件创建过一个URL，也会创建一个新的URL对象。
      需要使用URL.revokeObjectURL()方法释放之前的url。
       */
      for (const url of this.createdBlobRecords) {
        URL.revokeObjectURL(url)
      }
      // 将新的url写入createdBlobRecords中
      this.createdBlobRecords = [source]
      return source
    })
  }

  _getAudioSourceFromNetease (track: any) {
    if (isAccountLogin()) {
      return getMP3(track.id).then((result) => {
        if (!result.data[0]) return null
        if (!result.data[0].url) return null
        if (result.data[0].freeTrialInfo !== null) return null // 跳过只能试听的歌曲
        const source = result.data[0].url.replace(/^http:/, 'https:')
        const store = settingStore()
        if (store.automaticallyCacheSongs) {
          db.cacheTrackSource(track, source, result.data[0].br)
        }
        return source
      })
    }
    return new Promise((resolve) => {
      resolve(`https://music.163.com/song/media/outer/url?id=${track.id}`)
    })
  }

  async _getAudioSourceFromUnblockMusic (track: any) {
    const store = settingStore()
    console.debug(`[debug][Player.js] _getAudioSourceFromUnblockMusic`)
    if (!store.enableUnblockNeteaseMusic) {
      return null
    }
    const source = await ipcRenderer.invoke('unblock-music', track, store.unmSource)
    if (store.automaticallyCacheSongs && source?.url) {
      // TODO: 将unblockMusic字样换成真正的来源（比如酷我咪咕等）
      db.cacheTrackSource(track, source.url, 128000, 'unblockMusic')
    }
    return source?.url
  }

  _getNextTrack () {
    const next = this._reversed ? this.current - 1 : this.current + 1
    // _playNextList列表里的歌曲id不为空的时候，优先播放这个列表
    if (this._playNextList.length > 0) {
      const trackID = this._playNextList.shift()
      return [trackID!, this.current]
    }

    // 循环模式开启，则重新播放当前模式下的相对的下一首。歌曲为list列表里面的内容
    if (this.repeatMode === 'on') {
      if (this._reversed && this.current === 0) {
        // 倒序模式，当前歌曲是第一首，则重新播放列表最后一首
        return [this.list[this.list.length - 1], this.list.length - 1]
      } else if (this._reversed && this.current === this.list.length - 1) {
        // 正序模式，当前歌曲是最后一首，则重新播放第一首
        return [this.list[0], 0]
      }
    }
    return [this.list[next], next]
  }

  _getPrevTrack () {
    const next = this._reversed ? this.current + 1 : this.current - 1
    // 以下是考虑开启循环模式的情况
    if (this.repeatMode === 'on') {
      if (this.reversed && this.current === 0) {
        // 倒序模式，当前歌曲是最后一首，则重新播放列表第一首
        return [this.list[0], 0]
      } else if (this.list.length === this.current + 1) {
        // 正序模式，当前歌曲是第一首，则重新播放列表最后一首
        return [this.list[this.list.length - 1], this.list.length - 1]
      }
    }

    // 返回trackId及其对应的索引
    return [this._list[next], next]
  }

  _setPlaying (isPlaying: boolean) {
    this._playing = isPlaying
    if (isCreateTray) {
      ipcRenderer.send('updateTrayPlayState', this._playing)
    }
  }

  _playDiscordPresence (track: any, seekTime = 0) {
    const store = settingStore()
    if (!store.enableDiscordRichPresence) {
      return null
    }
    const copyTrack = { ...track }
    copyTrack.dt -= seekTime * 1000
    ipcRenderer.send('playDiscordPresence', copyTrack)
  }

  _loadPersonalFMNextTrack () {
    if (this._personalFMNextLoading) {
      return [false, undefined]
    }
    this._personalFMNextLoading = true
    return personalFM()
      .then((result) => {
        if (!result || !result.data) {
          this._personalFMNextTrack = { id: 0 }
        } else {
          this._personalFMNextTrack = result.data[0]
          this._cacheNextTrack() // cache next track
        }
        this._personalFMNextLoading = false
        return [true, this._personalFMNextTrack]
      })
      .catch(() => {
        this._personalFMNextTrack = { id: 0 }
        this._personalFMNextLoading = false
        return [false, this._personalFMNextTrack]
      })
  }

  setOutputDevice () {
    if (this._howler) {
      if (this._howler?._sounds.length <= 0 || !this._howler?._sounds[0]._node) {
        return
      }
      const store = settingStore()
      this._howler?._sounds[0]._node.setSinkId(store.outputDevice)
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
    const player: Record<string, any> = {}
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

  addTrackToPlayNext (trackID: number, playNow = false) {
    this._playNextList.push(trackID)
    if (playNow) {
      if (this.isPersonalFM) {
        this.playNextFMTrack()
      } else {
        this.playNextTrack()
      }
    }
  }

  playNextTrack () {
    const [trackID, index] = this._getNextTrack()
    if (trackID === undefined) {
      this._howler?.stop()
      this._setPlaying(false)
      return false
    }
    this.current = index
    this._replaceCurrentTrack(trackID)
    return true
  }

  async playNextFMTrack () {
    if (this._personalFMLoading) {
      return false
    }
    this._isPersonalFM = true // 设为私人模式
    // 私人FM下一首歌曲信息为假，开始缓存下一首歌曲
    if (!this._personalFMNextTrack) {
      this._personalFMNextLoading = true
      let result = null
      let retryCount = 5
      const store = toastStore()
      for (; retryCount >= 0; retryCount--) {
        result = await personalFM().catch(() => null)
        if (!result) {
          this._personalFMLoading = false
          store.showToast('personal fm timeout')
          return false
        }
        if (result.data?.length > 0) {
          break
        } else if (retryCount > 0) {
          await delay(1000)
        }
      }
      this._personalFMLoading = false
      if (retryCount < 0) {
        const content = '获取私人FM数据时重试次数过多，请手动切换下一首'
        store.showToast(content)
        return false
      }
      if (result) {
        // 这里只能拿到一条数据
        this._personalFMTrack = result.data[0]
      }
    } else {
      if (this._personalFMNextTrack.id === this._personalFMTrack.id) {
        return false
      }
      this._personalFMTrack = this._personalFMNextTrack
      if (this._isPersonalFM) {
        this._replaceCurrentTrack(this._personalFMTrack.id)
      }
      this._loadPersonalFMNextTrack()
      return true
    }
  }

  playPrevTrack () {
    const [trackID, index] = this._getPrevTrack()
    if (trackID === undefined) return false
    this.current = index
    this._replaceCurrentTrack(trackID, true, ' playPrevTrack')
    return true
  }

  play () {
    if (this._howler?.playing()) return
    this._howler?.play()
    this._setPlaying(true)
    if (this._currentTrack.name) {
      setTitle(this._currentTrack)
    }
    const store = lastfmStore()
    this._playDiscordPresence(this._currentTrack, this.seek())
    if (store.key !== undefined) {
      trackUpdateNowPlaying({
        artist: this.currentTrack.ar[0].name,
        track: this.currentTrack.name,
        album: this.currentTrack.al.name,
        trackNumber: this.currentTrack.no,
        duration: ~~(this.currentTrack.dt / 1000),
      })
    }
  }

  seek (time = null) {
    if (time !== null) {
      this._howler?.seek(time)
      if (this._playing) this._playDiscordPresence(this._currentTrack, this.seek())
    }
    return this._howler === null ? 0 : this._howler.seek()
  }

  removeTrackFromQueue (index: number) {
    this._playNextList.splice(index, 1)
  }
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
