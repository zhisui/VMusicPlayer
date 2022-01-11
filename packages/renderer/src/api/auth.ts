import request from '../utils/request'

// 注意：以下url为网易云音乐对应接口，不可随意更改
// @see https://neteasecloudmusicapi.vercel.app/#/?id=%e7%99%bb%e5%bd%95

// 手机登录
type PhoneParams = {
  phone: string
  password: string
  countryCode?: string
  md5_password?: string
}
export async function loginWithPhone (params: PhoneParams) {
  return request({
    url: '/login/cellphone',
    method: 'post',
    params,
  })
}

// 邮箱登录
type EmailParams = {
  email: string
  password: string
  md5_password?: string
}
export async function loginWithEmail (params: EmailParams) {
  return request({
    url: './login',
    method: 'post',
    params,
  })
}

// 生成二维码key值
export async function loginQrCodeKey () {
  return request({
    url: '/login/qr/key',
    method: 'get',
    params: {
      timestamp: Date.now(),
    },
  })
}

// 利用生成的key生成二维码
type QrCodeparams = {
  key: string
  qring?: string // 传入后会额外返回二维码图片base64编码
}
export async function createQrCode (params: QrCodeparams) {
  return request({
    url: '/login/qr/create',
    method: 'get',
    params: {
      ...params,
      timeStamp: Date.now(),
    },
  })
}

/**  二维码检测扫码状态接口
轮询此接口可获取二维码扫码状态,800为二维码过期,801为等待扫码,802为待确认,
803为授权登录成功(803状态码下会返回cookies)
*/
export async function checkQrCode (key: string) {
  return request({
    url: '/login/qr/check',
    method: 'get',
    params: {
      key,
      timestamp: Date.now(),
    },
  })
}
