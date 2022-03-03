import { defineStore } from 'pinia'
export const toastStore = defineStore('toast', {
  state: () => ({
    show: false,
    text: '',
  }),
  actions: {
    // showToast (text: string) {
    //   if (this.timer !== null) {
    //     clearTimeout(this.timer)
    //     this.show = false
    //     this.text = ''
    //     this.timer = null
    //   } else {
    //     this.show = true
    //     this.text = text
    //     this.timer = setTimeout(() => {
    //       this.show = true
    //       this.text = text
    //     }, 3200)
    //   }
    // },
    showToast (text: string) {
      this.show = true
      this.text = text
      setTimeout(() => {
        this.show = false
        this.text = ''
      }, 2000)
    },
  },
})
