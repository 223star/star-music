<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { debounce } from '@/utils/time'

const player = usePlayerStore()
const keyword = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const showResults = ref(false)
const searchSource = ref<'all' | 'bilibili' | 'netease' | 'qqmusic'>('all')

const doSearch = debounce(async (kw: string) => {
  if (!kw.trim()) return
  isSearching.value = true
  showResults.value = true
  try {
    const res = await fetch(`/api/search?keyword=${encodeURIComponent(kw)}&source=${searchSource.value}`)
    const data = await res.json()
    searchResults.value = data.tracks || []
  } catch (err) {
    console.error('搜索失败:', err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, 500)

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  keyword.value = val
  doSearch(val)
}

function selectTrack(track: any) {
  player.playTrack(track)
  showResults.value = false
  keyword.value = track.title
}

function setSource(source: typeof searchSource.value) {
  searchSource.value = source
  if (keyword.value) doSearch(keyword.value)
}

let blurTimer: ReturnType<typeof setTimeout> | null = null
function onBlur() {
  blurTimer = setTimeout(() => { showResults.value = false }, 200)
}
</script>

<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="搜索歌曲、歌手、B站视频..."
        @input="onInput"
        @focus="showResults = !!keyword"
        @blur="onBlur"
      />
      <div class="source-tabs" v-if="keyword">
        <button
          v-for="s in ([
            { key: 'all', label: '全部' },
            { key: 'bilibili', label: 'B站' },
            { key: 'netease', label: '网易云' },
            { key: 'qqmusic', label: 'QQ音乐' }
          ] as const)"
          :key="s.key"
          :class="['source-tab', { active: searchSource === s.key }]"
          @mousedown.prevent="setSource(s.key)"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- 搜索结果下拉 -->
    <div v-if="showResults && keyword" class="search-results-dropdown">
      <div v-if="isSearching" class="search-loading">
        <span class="loading-spinner"></span>
        搜索中...
      </div>
      <div v-else-if="searchResults.length === 0" class="search-empty">
        未找到结果
      </div>
      <div
        v-for="(track, index) in searchResults.slice(0, 20)"
        :key="track.id + index"
        class="search-result-item"
        @mousedown="selectTrack(track)"
      >
        <img :src="track.cover" class="result-cover" alt="" />
        <div class="result-info">
          <div class="result-title">{{ track.title }}</div>
          <div class="result-artist">{{ track.artist }}</div>
        </div>
        <span class="result-source">{{ track.source }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  flex: 1;
  max-width: 600px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 0 12px;
  gap: 8px;
  transition: all 0.3s;
}

.search-input-wrapper:focus-within {
  border-color: var(--scene-accent);
  box-shadow: 0 0 20px var(--scene-glow);
}

.search-icon {
  font-size: 16px;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  padding: 10px 0;
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.source-tabs {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.source-tab {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.source-tab.active {
  background: var(--scene-accent);
  color: white;
  opacity: 0.8;
}

/* 搜索结果下拉 */
.search-results-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 200;
  backdrop-filter: blur(20px);
}

.search-loading, .search-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--card-border);
  border-top-color: var(--scene-accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.result-cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.result-source {
  font-size: 11px;
  color: var(--scene-accent);
  background: rgba(99, 102, 241, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>
