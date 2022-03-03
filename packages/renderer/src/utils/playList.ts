import { useRouter } from 'vue-router'

import { playerStore } from '../store/playerStore'
import { userDataStore } from '../store/userData'
const router = useRouter()

export const hasListSource = () => {
  const storePlayer = playerStore()
  return !storePlayer.isPersonalFM && storePlayer.playlistSource.id !== 0
}

export const goToListSource = () => {
  router.push({ path: getListSourcePath().toString() })
}

export const getListSourcePath = () => {
  const storeUser = userDataStore()
  const storePlayer = playerStore()
  if (storePlayer.playlistSource.id === storeUser.likedSongPlaylistID) {
    return '/library/liked-songs'
  } else if (storePlayer.playlistSource.type === 'url') {
    return storePlayer.playlistSource.id
  } else if (storePlayer.playlistSource.type === 'cloudDisk') {
    return '/library'
  }
  return `/${storePlayer.playlistSource.type}/${storePlayer.playlistSource.id}`
}
