<template>
  <div class="account-container">
    <!-- 图片和‘登录网易云音乐账号’ -->
    <Icon id="icon-netease" icon="ri:netease-cloud-music-line" color="white" width="66" />
    <h2>登录网易云账号</h2>

    <!-- 二维码登录 -->
    <div v-if="data.mode === 'qrCode'">
      <div v-show="data.qrCodeImage">
        <img :src="data.qrCodeImage" />
      </div>
    </div>

    <!-- 邮箱登录 -->
    <div v-show="data.mode === 'email'">
      <div class="input-template" :class="{ active: data.inputFocus === 'email' }">
        <Icon icon="ic:baseline-email" class="icon" />

        <input
          v-model="data.email"
          type="email"
          :placeholder="data.inputFocus === 'email' ? '' : '邮箱'"
          @focus="data.inputFocus = 'email'"
          @blur="data.inputFocus = ''"
          @keyup.enter="login"
        />
      </div>
    </div>

    <!-- 手机登录 -->
    <div v-show="data.mode === 'phone'">
      <div class="input-template" :class="{ active: data.inputFocus === 'phone' }">
        <Icon icon="ic:outline-phone-iphone" class="icon" />

        <input
          id="countryNumber"
          v-model="data.countryCode"
          :placeholder="data.inputFocus === 'phone' ? '' : '+86'"
          @focus="data.inputFocus = 'phone'"
          @blur="data.inputFocus = ''"
          @keyup.enter="login"
        />
        <input
          v-model="data.phoneNumber"
          :placeholder="data.inputFocus === 'phone' ? '' : '手机'"
          @focus="data.inputFocus = 'phone'"
          @blur="data.inputFocus = ''"
          @keyup.enter="login"
        />
      </div>
    </div>

    <!--邮箱和手机登录的密码部分 -->
    <div v-show="data.mode !== 'qrCode'">
      <div class="input-template" :class="{ active: data.inputFocus === 'password' }">
        <Icon icon="dashicons:lock-alt" class="icon" />

        <input
          v-model="data.password"
          type="password"
          :placeholder="data.inputFocus === 'password' ? '' : '密码'"
          @focus="data.inputFocus = 'password'"
          @blur="data.inputFocus = ''"
          @keyup.enter="login"
        />
      </div>
    </div>

    <!-- 登录按钮 -->
    <div v-show="data.mode !== 'qrCode'">
      <button class="login-button" @click="login">登录</button>
      <!--点击登录按钮在按钮上显示loading动画 -->
      <button v-show="data.processing" class="loading" disabled>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 切换登录方式 -->
    <div class="change-mode">
      <a v-show="data.mode !== 'email'" @click="changeMode('email')">邮箱登录</a>
      <span v-show="data.mode !== 'email'">|</span>
      <a v-show="data.mode !== 'phone'" @click="changeMode('phone')">手机登录</a>
      <span v-show="data.mode === 'email'">|</span>
      <a v-show="data.mode !== 'qrCode'" @click="changeMode('qrCode')">二维码登录</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import md5 from 'crypto-js/md5'
import NProgress from 'nprogress'
import QRCode from 'qrcode'
import { onBeforeUnmount, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { LoginWithPhoneResponse } from '../api/types/auth'
import { ErrorResponse } from '../api/types/error'

import { checkQrCode, loginQrCodeKey, loginWithEmail, loginWithPhone } from '@/api/auth'
import { userDataStore } from '@/store/userData'
import { setCookie } from '@/utils/auth'
import { notError } from '@/utils/common'

const data = reactive({
  mode: 'qrCode',
  inputFocus: '',
  phoneNumber: '18767173965',
  countryCode: '+86',
  email: 'vmusic2022@163.com',
  password: 'Vmusic123',
  processing: false,
  qrCodeImage: '',
  qrCodeKey: '',
  checkQrCodeIntervalId: 898,
  qrCodeInformation: '打开网易云音乐App扫码登录',
})
const store = userDataStore()
const router = useRouter()
const route = useRoute()

onBeforeUnmount(() => {
  clearInterval(data.checkQrCodeIntervalId)
})

// 验证手机号及密码
const isValidPhone = () => {
  const regPhoneNumber = /^1\d{10}$/
  if (
    data.countryCode === '' ||
    !regPhoneNumber.test(data.phoneNumber) ||
    data.password === ''
  ) {
    alert('电话或密码输入有误，请重新输入')
    data.processing = false
    return false
  }
  return true
}

// 验证邮箱及密码
const isValidEmail = () => {
  const regEmail = /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z\-]+\.)+[A-Za-z]{2,}))$/
  if (data.email === '' || !regEmail.test(data.email) || data.password === '') {
    alert('邮箱及密码输入错误，请重新输入')
    data.processing = false
    return false
  }
  return true
}

// 登录时验证邮箱,手机及密码,传入参数时处理掉输入字符的空格
const login = () => {
  if (data.mode === 'phone') {
    if (!isValidPhone()) {
      return
    }
    data.processing = true
    loginWithPhone({
      phone: data.phoneNumber.replace(/\s/g, ''),
      password: 'fakePassword',
      countryCode: data.countryCode.replace('+', '').replace(/\s/g, ''),
      md5_password: md5(data.password).toString(),
    })
      .then(handleLoginResponse)
      .catch((err) => {
        data.processing = false
        window.alert(`发生错误，请检查你的账号密码是否正确\n${err}`)
      })
  }

  if (data.mode === 'email') {
    if (!isValidEmail()) {
    } else {
      data.processing = true
      loginWithEmail({
        email: data.email.replace(/\s/g, ''),
        password: 'fakePassword',
        md5_password: md5(data.password).toString(),
      })
        .then(handleLoginResponse)
        .catch((err) => {
          data.processing = false
          window.alert(`发生错误，请重新检查你的账号密码是否正确\n${err}`)
        })
    }
  }
}

const handleLoginResponse = (resData: LoginWithPhoneResponse | ErrorResponse) => {
  if (!resData) {
    data.processing = false
    return
  }

  if (notError<LoginWithPhoneResponse>(resData)) {
    setCookie(resData.cookie)
    store.loginMode = 'account'
    store.user = resData.profile

    store.fetchLikedPlaylist()
    router.push({ name: 'library' })
  } else {
    data.processing = false
    window.alert(resData.message ?? '账号或密码错误，请检查')
  }
}

// 获取二维码
const getQrCodekey = () => {
  return loginQrCodeKey().then((result) => {
    if (result.code === 200) {
      data.qrCodeKey = result.data.unikey
      QRCode.toDataURL(`https://music.163.com/login?codekey=${data.qrCodeKey}`, {
        width: 192,
        margin: 0,
        color: {
          dark: '#fff',
          light: '#000',
        },
      })
        .then((url) => {
          data.qrCodeImage = url
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          NProgress.done()
        })
    }
    checkQrCodeLogin()
  })
}

// 检查验证码是否有效并做响应的处理
const checkQrCodeLogin = () => {
  data.checkQrCodeIntervalId = setInterval(() => {
    if (data.qrCodeKey === '') return
    checkQrCode(data.qrCodeKey).then((result) => {
      switch (result.code) {
        case 800: {
          getQrCodekey() // 重新生成QrCode
          data.qrCodeInformation = '二维码已失效，请重新扫码'

          break
        }
        case 802: {
          data.qrCodeInformation = '扫描成功，请在手机上确认登录'

          break
        }
        case 801: {
          data.qrCodeInformation = '打开网易云音乐APP扫码登录'

          break
        }
        case 803: {
          clearInterval(data.checkQrCodeIntervalId)
          data.qrCodeInformation = '登录成功，请稍等...'
          result.code = 200
          result.cookie = result.cookie.replace('HTTPOnly', '')
          handleLoginResponse(result)

          break
        }
        // No default
      }
    })
  }, 1000)
}

const changeMode = (mode: string) => {
  data.mode = mode
  if (mode === 'qrCode') {
    checkQrCodeLogin()
  } else {
    clearInterval(data.checkQrCodeIntervalId)
  }
}
const init = () => {
  if (['phone', 'email', 'qrCode'].includes(route.query.mode)) {
    data.mode = router.query.mode
  }
  getQrCodekey()
}

init()
</script>

<style lang="scss" scoped>
.account-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 30px;

  h2 {
    margin-bottom: 60px;
  }

  #icon-netease {
    background-color: red;
    border-radius: 14px;
  }

  .input-template {
    color: #aaaaaa;
    text-align: center;
    display: flex;
    border-radius: 10px;
    width: 300px;
    background-color: var(--second-bg-color-transparent);
    padding: 10px;
    margin-bottom: 25px;
    .icon {
      font-size: 25px;
      margin-right: 9px;
      color: #aaaaaa;
    }
    #countryNumber {
      width: 14%;
      color: var(--primary-color);
    }

    input {
      border: none;
      outline: none;
      font-size: 18px;
      width: 70%;
      background: transparent;
      color: var(--text-color);
      font-weight: 600;
    }

    input::placeholder {
      color: var(--color-text);
    }
  }

  .active {
    background-color: var(--primary-bg-color);
    color: var(--primary-color);
    .icon {
    }

    input {
      color: var(--text-color);
    }
  }

  .login-button {
    padding: 10px;
    border-radius: 8px;
    width: 320px;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    transition: 0.2s;
    box-sizing: border-box;
    color: var(--primary-color);
    background-color: var(--primary-bg-color);
    margin-bottom: 20px;
    &:hover {
      transform: scale(1.12);
    }
    &:active {
      transform: scale(0.92);
    }
    .loading {
      height: 44px;
      cursor: unset;
    }

    .loading span {
      width: 6px;
      height: 6px;
      background-color: var(--primary-color);
      border-radius: 50%;
      margin: 0 2px;
      animation: loading 1.4s infinite both;
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }

  @keyframes loading {
    0% {
      opacity: 0.2;
    }

    20% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }

  a {
    padding: 0 12px;
    font-size: 14px;
  }
}
</style>
