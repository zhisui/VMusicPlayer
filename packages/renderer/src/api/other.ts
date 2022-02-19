import { mapTrackPlayableStatus } from '@/utils/common'
import request from '@/utils/request'

export const personalFM = () => {
  return request({
    url: '/personal_fm',
    method: 'get',
    params: {
      timestamp: Date.now(),
    },
  })
}
