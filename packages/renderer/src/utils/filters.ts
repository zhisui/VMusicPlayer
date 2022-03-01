import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

export const formatTime = (Milliseconds: number, format = 'HH:MM:SS') => {
  if (!Milliseconds) return ''
  dayjs.extend(duration)
  dayjs.extend(relativeTime)

  const time = dayjs.duration(Milliseconds)
  const hours = time.hours().toString()
  const mins = time.minutes().toString()
  const seconds = time.seconds().toString().padStart(2, '0')

  return hours !== '0'
    ? `${hours}:${mins.padStart(2, '0')}:${seconds}`
    : `${mins}:${seconds}`
}

export const formatDate = (timestamp: number, format = 'MMM D, YYYY') => {
  if (!timestamp) return ''
  return dayjs(timestamp).format(format)
}

export const formatAlbumType = (type: string, album: any) => {
  if (!type) return ''
  switch (type) {
    case 'EP/Single': {
      return album.size === 1 ? 'Single' : 'EP'
    }
    case 'Single': {
      return 'Single'
    }
    case '专辑': {
      return 'Album'
    }
  }
  return type
}

export const resizeImage = (imgUrl: string, size = 512) => {
  if (!imgUrl) return ''
  let httpsImgUrl = imgUrl
  if (imgUrl.slice(0, 5) !== 'https') {
    httpsImgUrl = 'https' + imgUrl.slice(4)
  }
  return `${httpsImgUrl}?param=${size}y${size}`
}

export const formatPlayCount = (count: number) => {
  if (!count) return ''

  if (count > 100000000) {
    return `${Math.floor((count / 100000000) * 100) / 100}亿` // 2.32 亿
  }
  if (count > 100000) {
    return `${Math.floor((count / 10000) * 10) / 10}万` // 232.1 万
  }
  if (count > 10000) {
    return `${Math.floor((count / 10000) * 100) / 100}万` // 2.3 万
  }
  return count
}

// Vue.filter('toHttps', (url) => {
//   if (!url) return ''
//   return url.replace(/^http:/, 'https:')
// })
