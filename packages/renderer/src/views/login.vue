<template>
  <div class="login-container">
    <div class="part1">
      <div class="log">
        <Icon icon="simple-icons:applemusic" color="#3d6ded" width="66" />
        <Icon id="and" icon="emojione-v1:heavy-multiplication-x" />
        <Icon
          id="icon-netease"
          icon="ri:netease-cloud-music-line"
          color="white"
          width="66"
        />
      </div>
    </div>

    <div class="part2">
      <div
        class="card"
        :class="{ active: cardIsActive === 1 }"
        @mouseover="cardIsActive = 1"
        @mouseleave="cardIsActive = 0"
        @click="goTo('account')"
      >
        <div>
          <h2>登录网易云账号</h2>
          <p>可访问数据</p>
        </div>
        <Icon id="arrow" icon="dashicons:arrow-right-alt2" />
      </div>

      <div
        class="card"
        :class="{ active: cardIsActive === 2 }"
        @mouseover="cardIsActive = 2"
        @mouseleave="cardIsActive = 0"
        @click="goTo('username')"
      >
        <div>
          <h2>搜素网易云账号</h2>
          <p>只能读取账号公开数据</p>
        </div>
        <Icon id="arrow" icon="dashicons:arrow-right-alt2" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Icon } from '@iconify/vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LogIn',
  components: {
    Icon,
  },
  data () {
    return {
      cardIsActive: 0,
    }
  },
  methods: {
    goTo (path: string) {
      this.$router.push({ path: '/login/' + path })
    },
  },
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.part1 {
  margin-top: 20px;
  #and {
    opacity: 0.3;
    margin: {
      right: 20px;
      left: 20px;
      bottom: 26px;
    }
  }
  #icon-netease {
    background-color: red;
    border-radius: 13px;
  }
}

.part2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  .card {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 300px;
    height: 128px;
    box-sizing: border-box;
    border-radius: 12px;
    background-color: #eaeffd;
    transition: all 0.3s;
    cursor: pointer;

    padding: {
      top: 10px;
      bottom: 10px;
    }
    margin: {
      top: 20px;
    }

    p {
      color: #5b7def;
      font-size: 14px;
      margin-top: -15px;
      transition: all 0.3s;
    }

    h2 {
      color: #335eea;
      transition: all 0.3s;
    }

    #arrow {
      font-size: 28px;
      opacity: 0;
      color: #3d6ded;
      transition: all 0.3s;
    }
  }
  .active {
    #arrow {
      opacity: 1;
      transform: translateX(10px);
    }

    h2,
    p {
      transform: translateX(-9px);
    }
  }
}
</style>
