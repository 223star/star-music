<script setup lang="ts">
import { ref } from 'vue'
import { usePlaylistStore } from '@/stores/playlist'
import { usePlayerStore } from '@/stores/player'
import { formatTime } from '@/utils/time'

const playlistStore = usePlaylistStore()
const player = usePlayerStore()

const showModal = ref(false)
const newPlaylistName = ref('')
const editingId = ref<string | null>(null)
const editName = ref('')

function open() {
  showModal.value = true
}

function close() {
  showModal.value = false
}

function createPlaylist() {
  if (!newPlaylistName.value.trim()) return
  playlistStore.createPlaylist(newPlaylistName.value.trim())
  newPlaylistName.value = ''
}

function removeTrack(plId: string, trackIndex: number) {
  playlistStore.removeFromPlaylist(plId, trackIndex)
}

function startEdit(id: string, name: string) {
  editingId.value = id
  editName.value = name
}

function finishEdit() {
  if (editingId.value && editName.value.trim()) {
    playlistStore.renamePlaylist(editingId.value, editName.value.trim())
  }
  editingId.value = null
}

function playFromPlaylist(plId: string, trackIndex: number) {
  const pl = playlistStore.playlists.find(p => p.id === plId)
  if (pl) {
    player.setQueue(pl.tracks, trackIndex)
  }
  close()
}

defineExpose({ open, close, showModal })
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="close">
        <div class="playlist-modal">
          <div class="modal-header">
            <h2>📋 我的歌单</h2>
            <button class="close-btn" @click="close">✕</button>
          </div>

          <!-- 创建新歌单 -->
          <div class="create-section">
            <input
              v-model="newPlaylistName"
              type="text"
              class="create-input"
              placeholder="新歌单名称"
              @keyup.enter="createPlaylist"
            />
            <button class="create-btn" @click="createPlaylist">+ 创建</button>
          </div>

          <!-- 歌单列表 -->
          <div class="playlists">
            <div
              v-for="pl in playlistStore.playlists"
              :key="pl.id"
              class="playlist-card"
            >
              <div class="playlist-header">
                <template v-if="editingId === pl.id">
                  <input
                    v-model="editName"
                    class="edit-input"
                    @keyup.enter="finishEdit"
                    @blur="finishEdit"
                    autofocus
                  />
                </template>
                <template v-else>
                  <div class="playlist-name">{{ pl.name }}</div>
                </template>
                <span class="playlist-count">{{ pl.tracks.length }} 首</span>
              </div>

              <div class="playlist-tracks">
                <div
                  v-for="(track, idx) in pl.tracks"
                  :key="track.id + idx"
                  class="pl-track-item"
                >
                  <div class="pl-track-info" @click="playFromPlaylist(pl.id, idx)">
                    <img :src="track.cover" class="pl-track-cover" alt="" />
                    <div class="pl-track-text">
                      <div class="pl-track-title">{{ track.title }}</div>
                      <div class="pl-track-artist">{{ track.artist }}</div>
                    </div>
                  </div>
                  <button class="remove-btn" @click="removeTrack(pl.id, idx)">✕</button>
                </div>
              </div>

              <div v-if="!pl.tracks.length" class="empty-playlist">
                歌单为空，快去搜索收藏歌曲吧
              </div>

              <div class="playlist-actions">
                <button class="pl-action" @click="startEdit(pl.id, pl.name)">
                  ✏️ 重命名
                </button>
                <button class="pl-action" v-if="pl.name !== '默认歌单'" @click="playlistStore.deletePlaylist(pl.id)">
                  🗑️ 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playlist-modal {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--card-border);
}

.modal-header h2 {
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}

.create-section {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--card-border);
}

.create-input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.create-input:focus {
  border-color: var(--scene-accent);
}

.create-btn {
  background: var(--scene-accent);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.playlists {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
}

.playlist-card {
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 12px;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.playlist-name {
  font-size: 15px;
  font-weight: 600;
}

.edit-input {
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--scene-accent);
  border-radius: 6px;
  padding: 4px 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.playlist-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.pl-track-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.pl-track-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 0;
}

.pl-track-cover {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

.pl-track-text {
  min-width: 0;
}

.pl-track-title {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-track-artist {
  font-size: 11px;
  color: var(--text-secondary);
}

.remove-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.5;
}

.remove-btn:hover {
  opacity: 1;
}

.empty-playlist {
  text-align: center;
  padding: 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.playlist-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--card-border);
}

.pl-action {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.pl-action:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .playlist-modal {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
