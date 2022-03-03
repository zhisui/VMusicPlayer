export interface LoginWithPhoneResponse {
  loginType: number
  code: number
  account: Account
  token: string
  profile: Profile
  bindings: Binding[]
  cookie: string
}

export interface Account {
  id: number
  userName: string
  type: number
  status: number
  whitelistAuthority: number
  createTime: number
  salt: string
  tokenVersion: number
  ban: number
  baoyueVersion: number
  donateVersion: number
  vipType: number
  viptypeVersion: number
  anonimousUser: boolean
  uninitialized: boolean
}

export interface Binding {
  userId: number
  url: string
  expired: boolean
  bindingTime: number
  tokenJsonStr: string
  expiresIn: number
  refreshTime: number
  id: number
  type: number
}

export interface Profile {
  followed: boolean
  backgroundUrl: string
  detailDescription: string
  avatarImgIdStr: string
  userId: number
  backgroundImgIdStr: string
  userType: number
  accountStatus: number
  vipType: number
  gender: number
  avatarImgId: number
  nickname: string
  backgroundImgId: number
  birthday: number
  city: number
  avatarUrl: string
  defaultAvatar: boolean
  province: number
  expertTags: null
  experts: Experts
  mutual: boolean
  remarkName: null
  authStatus: number
  djStatus: number
  description: string
  signature: string
  authority: number
  avatarImgId_str: string
  followeds: number
  follows: number
  eventCount: number
  avatarDetail: null
  playlistCount: number
  playlistBeSubscribedCount: number
}

export interface Experts {}
