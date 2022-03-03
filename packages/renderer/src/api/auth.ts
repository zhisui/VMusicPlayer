import { LoginWithPhoneResponse } from './types/auth'
import { ErrorResponse } from './types/error'

import request from '@/utils/request'

/** 注意：以下url为网易云音乐对应接口，不可随意更改
 @see https://neteasecloudmusicapi.vercel.app/#/?id=%e7%99%bb%e5%bd%95 */

// 手机登录
type PhoneParams = {
  phone: string
  password: string
  countryCode?: string
  md5_password?: string
}

export const loginWithPhone = async (params: PhoneParams) => {
  return (request({
    url: '/login/cellphone',
    method: 'post',
    params,
  }) as unknown) as Promise<LoginWithPhoneResponse | ErrorResponse>
}

// 邮箱登录
type EmailParams = {
  email: string
  password: string
  md5_password?: string
}

type LoginWithEmail = (params: EmailParams) => Promise<any>
export const loginWithEmail: LoginWithEmail = (params) => {
  return request({
    url: './login',
    method: 'post',
    params,
  })
}

// 生成二维码key值

type LoginQrCodeKey = () => Promise<any>
export const loginQrCodeKey: LoginQrCodeKey = () => {
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
  timeStamp?: number
}
type CreateQrCode = (params: QrCodeparams) => Promise<any>
export const createQrCode: CreateQrCode = (params) => {
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
type CheckQrCode = (key: string) => Promise<any>
export const checkQrCode: CheckQrCode = (key: string) => {
  return request({
    url: '/login/qr/check',
    method: 'get',
    params: {
      key,
      timestamp: Date.now(),
    },
  })
}

/**
 * 退出登录
 * 说明 : 调用此接口 , 可退出登录
 */
export const logout = () => {
  return request({
    url: '/logout',
    method: 'post',
  })
}
