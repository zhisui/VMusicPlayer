<template>
  <Modal
    class="add-playlist-modal"
    :show="show"
    :close="close"
    title="新建歌单"
    width="25vw"
  >
    <template #default>
      <input v-model="title" type="text" placeholder="歌单标题" maxlength="40" />
      <div class="checkbox">
        <input id="checkbox-private" v-model="privatePlaylist" type="checkbox" />
        <label for="checkbox-private">设置为隐私歌单</label>
      </div>
    </template>

    <template #footer>
      <button class="primary block" @click="createNewPlaylist">创建</button>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import { modalsStore } from '../store/modalsStore'
import { toastStore } from '../store/toastStore'
import { userDataStore } from '../store/userData'

import { addOrRemoveTrackFromPlaylist, createPlaylist } from '@/api/playlist'
import Modal from '@/components/Modal.vue'
const title = ref('')
const privatePlaylist = ref(false)
const storeModals = modalsStore()
const storeToast = toastStore()
const storeUser = userDataStore()

const show = computed({
  get: () => {
    return storeModals.newPlaylistModal.show
  },
  set: (value: boolean) => {
    return (storeModals.newPlaylistModal.show = value)
  },
})

const close = () => {
  show.value = false
  title.value = ''
  privatePlaylist.value = false
  resetAfterCreateAddTrackID()
}

const createNewPlaylist = () => {
  const params = { type: 'NORMAL', name: title.value }
  if (privatePlaylist.value) params.privacy = 10
  createPlaylist(params).then((data) => {
    if (data.code === 200) {
      if (storeModals.newPlaylistModal.afterCreateAddTrackID !== 0) {
        addOrRemoveTrackFromPlaylist({
          op: 'add',
          pid: data.id,
          tracks: storeModals.newPlaylistModal.afterCreateAddTrackID.toString(),
        }).then((data) => {
          if (data.body.code === 200) {
            storeToast.showToast('已添加到歌单')
          } else {
            storeToast.showToast(data.body.message)
          }
          resetAfterCreateAddTrackID()
        })
      }
      close()
      storeToast.showToast('成功创建歌单')
      storeUser.libraryPlaylistFilter = '创建的歌单'
      storeUser.fetchLikedPlaylist()
    }
  })
}
const resetAfterCreateAddTrackID = () => {
  storeModals.newPlaylistModal.afterCreateAddTrackID = 0
}
</script>

<style lang="scss" scoped>
.add-playlist-modal {
  .content {
    display: flex;
    flex-direction: column;
    input {
      margin-bottom: 12px;
    }
    input[type='text'] {
      width: calc(100% - 24px);
      flex: 1;
      background: var(--color-secondary-bg-for-transparent);
      font-size: 16px;
      border: none;
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 8px;
      margin-top: 3px;
      color: var(--color-text);
      &:focus {
        background: var(--color-primary-bg-for-transparent);
        opacity: 1;
      }
      [data-theme='light'] &:focus {
        color: var(--color-primary);
      }
    }
    .checkbox {
      input[type='checkbox' i] {
        margin: 3px 3px 3px 4px;
      }
      display: flex;
      align-items: center;
      label {
        font-size: 12px;
      }
    }
  }
}
</style>
