<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useThemeStore } from '@/stores/theme'
import type { Track, SceneType } from '@/types'

const player = usePlayerStore()
const playlistStore = usePlaylistStore()
const theme = useThemeStore()

const emit = defineEmits<{ play: [track: Track] }>()
const activeTab = ref<'search' | 'playlist'>('search')

// 搜索相关（从 SearchBar 共享状态，这里简单处理）
const searchResults = ref<Track[]>([])
const searchKeyword = ref('')

// 监听播放器当前歌曲变化来加载搜索结果
async function doSearch(keyword: string) {
  if (!keyword.trim()) return
  searchKeyword.value = keyword
  try {
    const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}&source=all`)
    const data = await res.json()
    searchResults.value = data.tracks || []
  } catch {
    searchResults.value = []
  }
}

function playTrack(track: Track) {
  player.playTrack(track)
}

function addToPlaylist(track: Track) {
  const pl = playlistStore.defaultPlaylist
  if (pl) {
    playlistStore.addToPlaylist(pl.id, track)
  }
}

function removeTrack(index: number) {
  if (playlistStore.currentPlaylist) {
    playlistStore.removeFromPlaylist(playlistStore.currentPlaylist.id, index)
  }
}

// 场景与歌曲气氛匹配
function getSceneEmoji(scene?: SceneType): string {
  const map: Record<string, string> = {
    wave: '🌊', particle: '✨', aurora: '🌌',
    vinyl: '💿', nebula: '🌠', firefly: '🪲'
  }
  return map[scene || 'wave'] || '🎵'
}

// 暴露给父组件
defineExpose({ doSearch })
</script>

<template>
  <div class="track-list">
    <!-- Tab 切换 -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'search' }]"
        @click="activeTab = 'search'"
      >
        🔍 搜索结果
      </button>
      <button
        :class="['tab', { active: activeTab === 'playlist' }]"
        @click="activeTab = 'playlist'"
      >
        📋 {{ playlistStore.currentPlaylist?.name || '当前歌单' }}
      </button>
    </div>

    <!-- 搜索结果列表 -->
    <div v-if="activeTab === 'search'" class="list-content">
      <div v-if="searchKeyword" class="list-header">
        搜索 "{{ searchKeyword }}" 共 {{ searchResults.length }} 首
      </div>
      <div v-else class="list-header hint">
        💡 在上方搜索框输入歌曲名或B站视频关键词
      </div>

      <div v-if="searchResults.length === 0 && searchKeyword" class="empty-state">
        暂无结果，试试其他关键词或切换音乐源
      </div>

      <div
        v-for="(track, index) in searchResults"
        :key="track.id + index"
        :class="['track-item', { active: player.currentTrack?.id === track.id }]"
        @click="playTrack(track)"
      >
        <img :src="track.cover" class="track-cover" alt="" />
        <div class="track-info">
          <div class="track-title">{{ track.title }}</div>
          <div class="track-artist">
            {{ track.artist }}
            <span class="track-source">{{ track.source }}</span>
          </div>
        </div>
        <div class="track-actions">
          <button class="btn-small" @click.stop="addToPlaylist(track)" title="收藏到歌单">
            ➕
          </button>
        </div>
      </div>
    </div>

    <!-- 歌单列表 -->
    <div v-else class="list-content">
      <div class="list-header">
        {{ playlistStore.currentPlaylist?.name || '默认歌单' }}
        <span class="track-count">
          {{ playlistStore.currentPlaylist?.tracks.length || 0 }} 首
        </span>
      </div>

      <div v-if="!playlistStore.currentPlaylist?.tracks.length" class="empty-state">
        💭 歌单是空的，搜索歌曲并点击 ➕ 收藏吧
      </div>

      <div
        v-for="(track, index) in playlistStore.currentPlaylist?.tracks || []"
        :key="track.id + index"
        :class="['track-item', { active: player.currentTrack?.id === track.id }]"
        @click="playTrack(track)"
      >
        <img :src="track.cover" class="track-cover" alt="" />
        <div class="track-info">
          <div class="track-title">{{ track.title }}</div>
          <div class="track-artist">{{ track.artist }}</div>
        </div>
        <div class="track-actions">
          <button class="btn-small btn-remove" @click.stop="removeTrack(index)" title="移除">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  background: var(--card-bg);
  border-radius: 10px;
  padding: 4px;
  border: 1px solid var(--card-border);
}

.tab {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: var(--scene-accent);
  color: white;
  opacity: 0.9;
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

.list-header {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 8px 4px;
  margin-bottom: 4px;
}

.list-header.hint {
  text-align: center;
  padding: 40px 20px;
  line-height: 1.6;
}

.track-count {
  float: right;
  opacity: 0.6;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.track-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.track-item.active {
  background: rgba(99, 102, 241, 0.15);
  border-left: 3px solid var(--scene-accent);
}

.track-cover {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.track-source {
  font-size: 10px;
  background: rgba(99, 102, 241, 0.15);
  color: var(--scene-accent);
  padding: 1px 6px;
  border-radius: 3px;
}

.track-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.btn-small {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0.5;
}

.btn-small:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.btn-remove {
  font-size: 12px;
  color: #ff6b6b;
}
</style>
