<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useThemeStore } from './stores/theme'
import SearchBar from './components/SearchBar.vue'
import TrackList from './components/TrackList.vue'
import PlayerBar from './components/PlayerBar.vue'
import FullModePlayer from './components/FullModePlayer.vue'
import PlaylistManager from './components/PlaylistManager.vue'
import SceneSelector from './components/SceneSelector.vue'
import DanmakuOverlay from './components/DanmakuOverlay.vue'
import MoodSelector from './components/MoodSelector.vue'

const theme = useThemeStore()
const playlistRef = ref<InstanceType<typeof PlaylistManager> | null>(null)

function openPlaylist() { playlistRef.value?.open() }

onMounted(() => {
  const mood = theme.getTimeBasedMood()
  theme.setMood(mood)
})
</script>

<template>
  <div class="app">
    <FullModePlayer />
    <DanmakuOverlay />

    <!-- 顶部栏 -->
    <header class="topbar">
      <div class="topbar-left">
        <span class="logo">✦ star-music</span>
      </div>
      <SearchBar />
      <div class="topbar-right">
        <MoodSelector />
        <SceneSelector />
        <button class="icon-btn" @click="openPlaylist" title="歌单">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main">
      <TrackList />
    </main>

    <!-- 底部播放条 -->
    <PlayerBar />

    <PlaylistManager ref="playlistRef" />
  </div>
</template>

<style scoped>
.app { height: 100vh; display: flex; flex-direction: column; background: var(--bg-primary); }

.topbar {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 24px;
  background: rgba(10,10,20,0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  z-index: 100; flex-shrink: 0;
}

.topbar-left { flex-shrink: 0; }
.logo { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.topbar-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
  background: none; border: none;
  color: var(--text-secondary); cursor: pointer;
  transition: all var(--transition);
}
.icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.main { flex: 1; overflow-y: auto; padding: 16px 24px; }

@media (max-width: 768px) {
  .topbar { padding: 8px 12px; gap: 8px; flex-wrap: wrap; }
  .main { padding: 8px 12px; }
}
</style>