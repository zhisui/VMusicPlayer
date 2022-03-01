import { defineStore } from 'pinia'

export const playerStore = defineStore('player', {
  // arrow function recommended for full type inference
  state: () => {
    return {
      playing: false, // 是否正在播放中
      progress: 12, // 当前播放歌曲的进度
      enabled: true, // 是否启用Player
      repeatMode: 'off', // off | on | one
      shuffle: false, // true | false
      reversed: false,
      volume: 1, // 0 to 1
      volumeBeforeMuted: 1, // 用于保存静音前的音量
      personalFMLoading: false, // 是否正在私人FM中加载新的track
      personalFMNextLoading: false, // 是否正在缓存私人FM的下一首歌曲

      // 播放信息
      list: [], // 播放列表
      current: 0, // 当前播放歌曲在播放列表里的index
      shuffledList: [], // 被随机打乱的播放列表，随机播放模式下会使用此播放列表
      shuffledCurrent: 0, // 当前播放歌曲在随机列表里面的index
      playlistSource: { type: 'album', id: 0 }, // 当前播放列表的信息，可能是记录的是歌单id,可能记录的是具体的资源路径,因为这个地方不能传入多个类型，一些没有sourceId的歌单就传入第一首的id
      currentTrack: { id: 86827685, dt: 0, name: '', no: 0, al: {}, ar: [] }, // 当前播放歌曲的详细信息
      playNextList: [], // 当这个list不为空时，会优先播放这个list的歌
      isPersonalFM: false, // 是否是私人FM模式
      personalFMTrack: {
        artists: [{ name: '', id: 0 }],
        album: { id: 0, picUrl: '' },
        ar: {},
        name: '',
        id: 0,
      }, // 私人FM当前歌曲
      personalFMNextTrack: {
        artists: [{ name: '', id: 0 }],
        album: { id: 0, picUrl: '' },
        ar: {},
        name: '',
        id: 0,
      }, // 私人FM下一首歌曲信息（为了快速加载下一首）
      createdBlobRecords: [],
      howler: null,
    }
  },
})
