<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { debounce } from '@/utils/time'
import { searchAll, searchNetease, searchQQMusic } from '@/utils/api'

const player = usePlayerStore()
const keyword = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const showResults = ref(false)
const searchSource = ref<'all' | 'netease' | 'qqmusic'>('all')

const doSearch = debounce(async (kw: string) => {
  if (!kw.trim()) { searchResults.value = []; return }
  isSearching.value = true
  showResults.value = true
  try {
    if (searchSource.value === 'all') {
      searchResults.value = await searchAll(kw)
    } else if (searchSource.value === 'netease') {
      searchResults.value = await searchNetease(kw)
    } else {
      searchResults.value = await searchQQMusic(kw)
    }
  } catch (err) {
    console.error('搜索失败:', err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, 400)

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
    <div class="search-inner">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="搜索歌曲、歌手..."
        @input="onInput"
        @focus="showResults = !!keyword"
        @blur="onBlur"
      />
      <div class="source-tabs">
        <button :class="['source-tab', { active: searchSource === 'all' }]" @click="setSource('all')">全部</button>
        <button :class="['source-tab', { active: searchSource === 'netease' }]" @click="setSource('netease')">网易云</button>
        <button :class="['source-tab', { active: searchSource === 'qqmusic' }]" @click="setSource('qqmusic')">QQ</button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="showResults && keyword" class="search-dropdown" @click.self="showResults = false">
          <div class="dropdown-content">
            <div class="dropdown-header">{{ searchResults.length }} 个结果</div>
            <div v-if="isSearching" class="dropdown-loading">
              <div class="spinner"></div>
              <span>搜索中...</span>
            </div>
            <div v-else-if="searchResults.length === 0" class="dropdown-empty">
              未找到结果，试试其他关键词
            </div>
            <div
              v-for="(track, index) in searchResults.slice(0, 30)"
              :key="track.id + '-' + index"
              class="search-item"
              @mousedown="selectTrack(track)"
            >
              <img :src="track.cover" class="item-cover" alt="" loading="lazy" />
              <div class="item-info">
                <div class="item-title">{{ track.title }}</div>
                <div class="item-artist">{{ track.artist }}</div>
              </div>
              <span :class="['item-badge', track.source]">
                {{ track.source === 'netease' ? '网易云' : 'QQ' }}
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.search-container { position: relative; flex: 1; max-width: 520px; }
.search-inner {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 0 12px;
  transition: all 0.25s;
}
.search-inner:focus-within {
  border-color: rgba(99,102,241,0.5); background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.search-icon { width: 18px; height: 18px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  color: #fff; font-size: 14px; padding: 10px 0; min-width: 0;
}
.search-input::placeholder { color: rgba(255,255,255,0.25); }
.source-tabs { display: flex; gap: 2px; flex-shrink: 0; }
.source-tab {
  background: none; border: none; color: rgba(255,255,255,0.3);
  font-size: 11px; padding: 4px 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.source-tab.active { background: rgba(99,102,241,0.2); color: #818cf8; }

/* 下拉结果 */
.search-dropdown {
  position: fixed; inset: 0; z-index: 500; pointer-events: none;
}
.dropdown-content {
  position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
  width: min(520px, 90vw); max-height: 420px; overflow-y: auto;
  background: rgba(22,22,40,0.98); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; pointer-events: auto;
  backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.dropdown-header { padding: 14px 16px 8px; font-size: 12px; color: rgba(255,255,255,0.3); }
.dropdown-loading, .dropdown-empty { padding: 32px; text-align: center; color: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; gap: 8px; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.06); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.search-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 16px;
  cursor: pointer; transition: background 0.15s;
}
.search-item:hover { background: rgba(99,102,241,0.08); }
.item-cover { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.item-info { flex: 1; min-width: 0; }
.item-title { font-size: 14px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-artist { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 2px; }
.item-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
.item-badge.netease { background: rgba(212,52,35,0.15); color: #d43423; }
.item-badge.qqmusic { background: rgba(0,202,77,0.15); color: #00ca4d; }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.2s, transform 0.2s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }
</style>