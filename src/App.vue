<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useThemeStore } from './stores/theme'
import SearchBar from './components/SearchBar.vue'
import TrackList from './components/TrackList.vue'
import PlayerControls from './components/PlayerControls.vue'
import FullModePlayer from './components/FullModePlayer.vue'
import PlaylistManager from './components/PlaylistManager.vue'
import SceneSelector from './components/SceneSelector.vue'
import DanmakuOverlay from './components/DanmakuOverlay.vue'
import MoodSelector from './components/MoodSelector.vue'

const theme = useThemeStore()
const playlistManagerRef = ref<InstanceType<typeof PlaylistManager> | null>(null)

function openPlaylistManager() {
  playlistManagerRef.value?.open()
}

onMounted(() => {
  // 初始场景
  theme.setScene('wave')
  // 根据时间推荐心情
  const mood = theme.getTimeBasedMood()
  theme.setMood(mood)
})
</script>

<template>
  <div class="app-container" :class="[`scene-${theme.currentScene}`, theme.currentSkin]">
    <!-- 全屏播放模式 -->
    <FullModePlayer />

    <!-- 弹幕层 -->
    <DanmakuOverlay />

    <!-- 主界面 -->
    <div class="main-layout">
      <!-- 顶部：搜索 + 操作 -->
      <header class="top-bar">
        <div class="logo">
          <span class="logo-icon">🎵</span>
          <h1 class="logo-text">FreeMusic</h1>
        </div>
        <SearchBar />
        <div class="top-actions">
          <MoodSelector />
          <SceneSelector />
          <button class="btn-icon" @click="openPlaylistManager" title="歌单">
            📋
          </button>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="content">
        <TrackList />
      </main>

      <!-- 底部播放控制条 -->
      <PlayerControls />
    </div>

    <!-- 歌单管理弹窗 -->
    <PlaylistManager ref="playlistManagerRef" />
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: var(--scene-bg);
  transition: background 0.8s ease;
  position: relative;
  overflow: hidden;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* 顶部栏 */
.top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(15, 15, 26, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--card-border);
  z-index: 100;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--scene-accent), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-icon {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.btn-icon:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--scene-accent);
  transform: scale(1.05);
}

/* 内容区 */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .top-bar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
  }
  .logo-text {
    font-size: 16px;
  }
  .content {
    padding: 8px 12px;
  }
}
</style>
