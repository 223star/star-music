<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import type { MoodType } from '@/types'

const theme = useThemeStore()

const moodList: { mood: MoodType; label: string; emoji: string }[] = [
  { mood: 'happy', label: '开心', emoji: '😊' },
  { mood: 'sad', label: '难过', emoji: '😢' },
  { mood: 'calm', label: '平静', emoji: '😌' },
  { mood: 'energetic', label: '活力', emoji: '⚡' },
  { mood: 'romantic', label: '浪漫', emoji: '🥰' },
  { mood: 'melancholy', label: '忧郁', emoji: '🌧️' },
  { mood: 'random', label: '随机', emoji: '🎲' }
]

function selectMood(mood: MoodType) {
  theme.setMood(mood)
}
</script>

<template>
  <div class="mood-selector">
    <button class="mood-trigger" title="心情推荐">
      <span class="current-mood">{{ theme.moodConfigs.find(m => m.mood === theme.currentMood)?.emoji || '🎵' }}</span>
    </button>
    <div class="mood-menu">
      <div class="mood-title">根据心情选歌</div>
      <div class="mood-grid">
        <button
          v-for="m in moodList"
          :key="m.mood"
          :class="['mood-btn', { active: theme.currentMood === m.mood }]"
          @click="selectMood(m.mood)"
        >
          <span class="mood-emoji">{{ m.emoji }}</span>
          <span class="mood-label">{{ m.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mood-selector {
  position: relative;
}

.mood-trigger {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-trigger:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--scene-accent);
}

.current-mood {
  display: block;
}

.mood-menu {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 12px;
  z-index: 300;
  backdrop-filter: blur(20px);
  min-width: 200px;
}

.mood-selector:hover .mood-menu {
  display: block;
}

.mood-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-align: center;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 6px 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.mood-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.mood-btn.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--scene-accent);
  color: var(--scene-accent);
}

.mood-emoji {
  font-size: 20px;
}

@media (max-width: 768px) {
  .mood-menu {
    left: auto;
    right: 0;
    transform: none;
  }
}
</style>
