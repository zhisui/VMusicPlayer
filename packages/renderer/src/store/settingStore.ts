import { defineStore } from 'pinia'

import shortcuts from '@/utils/shortcuts'
import { playlistCategories } from '@/utils/staticData'

const enabledPlaylistCategories = playlistCategories
  .filter((item) => {
    return item.enable === true
  })
  .map((i) => i.name)
export const settingStore = defineStore('setting', {
  state: () => ({
    lang: null,
    musicLanguage: 'all',
    appearance: 'auto',
    musicQuality: 320000,
    lyricFontSize: 28,
    outputDevice: 'default',
    showPlaylistsByAppleMusic: true,
    enableUnblockNeteaseMusic: true,
    automaticallyCacheSongs: true,
    cacheLimit: 8192,
    enableReversedMode: false,
    nyancatStyle: false,
    showLyricsTranslation: true,
    lyricsBackground: true,
    closeAppOption: 'ask',
    enableDiscordRichPresence: false,
    enableGlobalShortcut: true,
    showLibraryDefault: false,
    subTitleDefault: false,
    enabledPlaylistCategories,
    proxyConfig: {
      protocol: 'noProxy',
      server: '',
      port: null,
    },
    shortcuts: shortcuts,
    unmSource: '',
  }),
})
