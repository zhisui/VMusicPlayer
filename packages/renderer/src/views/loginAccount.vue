<template>
  <div class="account-container">
    <!-- 图片和‘登录网易云音乐账号’ -->
    <Icon id="icon-netease" icon="ri:netease-cloud-music-line" color="white" width="66" />
    <h2>登录网易云账号</h2>

    <!-- 二维码登录 -->
    <div v-if="mode === 'qrCode'">
      <div v-show="qrCodeImage">
        <img :src="qrCodeImage" />
      </div>
      <p v-show="mode === 'qrCode'">{{ qrCodeInformation }}</p>
    </div>

    <!-- 邮箱登录 -->
    <div v-show="mode === 'email'">
      <div class="input-template" :class="{ active: inputFocus === 'email' }">
        <Icon icon="ic:baseline-email" class="icon" />

        <input
          v-model="email"
          type="email"
          :placeholder="inputFocus === 'email' ? '' : '邮箱'"
          @focus="inputFocus = 'email'"
          @blur="inputFocus = ''"
          @keyup.enter="login"
        />
      </div>
    </div>

    <!-- 手机登录 -->
    <div v-show="mode === 'phone'">
      <div class="input-template" :class="{ active: inputFocus === 'phone' }">
        <Icon icon="ic:outline-phone-iphone" class="icon" />

        <input
          id="countryNumber"
          v-model="countryCode"
          :placeholder="inputFocus === 'phone' ? '' : '+86'"
          @focus="inputFocus = 'phone'"
          @blur="inputFocus = ''"
          @keyup.enter="login"
        />
        <input
          v-model="phoneNumber"
          :placeholder="inputFocus === 'phone' ? '' : '手机'"
          @focus="inputFocus = 'phone'"
          @blur="inputFocus = ''"
          @keyup.enter="login"
        />
      </div>
    </div>

    <!--邮箱和手机登录的密码部分 -->
    <div v-show="mode !== 'qrCode'">
      <div class="input-template" :class="{ active: inputFocus === 'password' }">
        <Icon icon="dashicons:lock-alt" class="icon" />

        <input
          v-model="password"
          type="password"
          :placeholder="inputFocus === 'password' ? '' : '密码'"
          @focus="inputFocus = 'password'"
          @blur="inputFocus = ''"
          @keyup.enter="login"
        />
      </div>
    </div>

    <!-- 登录按钮 -->
    <div v-show="mode !== 'qrCode'">
      <button class="login-button" @click="login">登录</button>
      <!--点击登录按钮在按钮上显示loading动画 -->
      <button v-show="processing" class="loading" disabled>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 切换登录方式 -->
    <div class="change-mode">
      <a v-show="mode !== 'email'" @click="changeMode('email')">邮箱登录</a>
      <span v-show="mode !== 'email'">|</span>
      <a v-show="mode !== 'phone'" @click="changeMode('phone')">手机登录</a>
      <span v-show="mode === 'email'">|</span>
      <a v-show="mode !== 'qrCode'" @click="changeMode('qrCode')">二维码登录</a>
    </div>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue'
import md5 from 'crypto-js/md5'
import NProgress from 'nprogress'
import QRCode from 'qrcode'
import { defineComponent } from 'vue'
import { mapActions, mapMutations } from 'vuex'

import { checkQrCode, loginQrCodeKey, loginWithEmail, loginWithPhone } from '../api/auth.ts'
import { setCookie } from '../utils/auth.ts'

export default defineComponent({
  name: 'LoginAccount',
  components: { Icon },
  data () {
    return {
      mode: 'qrCode',
      inputFocus: '',
      phoneNumber: '18767173965',
      countryCode: '+86',
      email: 'vmusic2022@163.com',
      password: 'Vmusic123',
      processing: false,
      qrCodeImage: '',
      qrCodeKey: '',
      checkQrCodeIntervalId: null,
      qrCodeInformation: '打开网易云音乐App扫码登录',
      informationData: '看登陆后的返回参数',
    }
  },

  created () {
    if (['phone', 'email', 'qrCode'].includes(this.$route.query.mode)) {
      this.mode = this.$route.query.mode
    }

    this.getQrCodekey()
  },

  beforeUnmount () {
    clearInterval(this.checkQrCodeIntervalId)
    this.checkQrCodeIntervalId = null
  },

  methods: {
    ...mapMutations(['updateData']),
    ...mapActions(['fetchUserProfile', 'fetchLikedPlaylist']),

    // 验证手机号及密码
    isValidPhone () {
      const regPhoneNumber = /^1\d{10}$/
      if (
        this.countryCode === '' ||
        !regPhoneNumber.test(this.phoneNumber) ||
        this.password === ''
      ) {
        alert('电话或密码输入有误，请重新输入')
        this.processing = false
        return false
      }
      return true
    },

    // 验证邮箱及密码
    isValidEmail () {
      const regEmail = /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z\-]+\.)+[A-Za-z]{2,}))$/
      if (this.email === '' || !regEmail.test(this.email) || this.password === '') {
        alert('邮箱及密码输入错误，请重新输入')
        this.processing = false
        return false
      }
      return true
    },

    // 登录时验证邮箱,手机及密码,传入参数时处理掉输入字符的空格
    login () {
      if (this.mode === 'phone') {
        if (!this.isValidPhone()) {
          return
        }
        this.processing = true
        loginWithPhone({
          phone: this.phoneNumber.replace(/\s/g, ''),
          password: 'fakePassword',
          countryCode: this.countryCode.replace('+', '').replace(/\s/g, ''),
          md5_password: md5(this.password).toString(),
        })
          .then(this.handleLoginResponse)
          .catch((err) => {
            this.processing = false
            window.alert(`发生错误，请检查你的账号密码是否正确\n${err}`)
          })
      }

      if (this.mode === 'email') {
        if (!this.isValidPhone()) {
        } else {
          this.processing = true
          loginWithEmail({
            email: this.email.replace(/\s/g, ''),
            password: 'fakePassword',
            md5_password: md5(this.password).toString(),
          })
            .then(this.handleLoginResponse)
            .catch((err) => {
              this.progress = false
              window.alert(`发生错误，请重新检查你的账号密码是否正确\n${err}`)
            })
        }
      }
    },

    // 处理请求的响应体 待写，需要看下响应数据
    // handleLoginResponse(data) {
    //   if (!data) {
    //     this.processing = false
    //     return
    //   }
    //   if (data.code === 200) {
    //     this.informationData = data
    //     setCookie(data.cookie)
    //     this.updateData({ key: 'loginMode', value: 'account' })
    //     console.log(this.$store.state.data);
    //     this.fetchUserProfile().then(() => {
    //       console.log(this.$store.state.data);
    //       this.fetchLikedPlaylist().then(() => {
    //         console.log(this.$store.state.data);
    //         this.$router.push({ name: 'library' })
    //         console.log('登录成功');
    //        })
    //     })

    //   } else {
    //     this.processing = false
    //     window.alert(data.msg ?? data.message ?? '账号或密码错误，请检查')
    //   }
    // },

    handleLoginResponse (data) {
      if (!data) {
        this.processing = false
        return
      }
      if (data.code === 200) {
        this.informationData = data
        setCookie(data.cookie)
        this.updateData({ key: 'loginMode', value: 'account' })
        this.updateData({ key: 'user', value: data.profile })

        this.fetchLikedPlaylist().then((res) => {
          // this.updateLikedXXX({ name: 'playlists', data: res.playlist })
          // this.updateData({ key: 'likedSongPlaylistID', value: res.playlist[0].id })
          this.$router.push({ name: 'library' })
        })
      } else {
        this.processing = false
        window.alert(data.msg ?? data.message ?? '账号或密码错误，请检查')
      }
    },

    // 获取二维码
    getQrCodekey () {
      return loginQrCodeKey().then((result) => {
        if (result.code === 200) {
          this.qrCodeKey = result.data.unikey
          QRCode.toDataURL(`https://music.163.com/login?codekey=${this.qrCodeKey}`, {
            width: 192,
            margin: 0,
            color: {
              dark: '#fff',
              light: '#000',
            },
          })
            .then((url) => {
              this.qrCodeImage = url
            })
            .catch((err) => {
              console.error(err)
            })
            .finally(() => {
              NProgress.done()
            })
        }
        this.checkQrCodeLogin()
      })
    },

    // 检查验证码是否有效并做响应的处理
    checkQrCodeLogin () {
      this.checkQrCodeIntervalId = setInterval(() => {
        if (this.qrCodeKey === '') return
        checkQrCode(this.qrCodeKey).then((result) => {
          switch (result.code) {
            case 800: {
              this.getQrCodeKey() // 重新生成QrCode
              this.qrCodeInformation = '二维码已失效，请重新扫码'

              break
            }
            case 802: {
              this.qrCodeInformation = '扫描成功，请在手机上确认登录'

              break
            }
            case 801: {
              this.qrCodeInformation = '打开网易云音乐APP扫码登录'

              break
            }
            case 803: {
              clearInterval(this.checkQrCodeIntervalId)
              this.qrCodeInformation = '登录成功，请稍等...'
              result.code = 200
              result.cookie = result.cookie.replace('HTTPOnly', '')
              this.handleLoginResponse(result)

              break
            }
            // No default
          }
        })
      }, 1000)
    },

    changeMode (mode) {
      this.mode = mode
      if (mode === 'qrCode') {
        this.checkQrCodeLogin()
      } else {
        clearInterval(this.checkQrCodeIntervalId)
      }
    },
  },
})
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
