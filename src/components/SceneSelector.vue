<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import type { SceneType } from '@/types'

const theme = useThemeStore()

const scenes: { type: SceneType; label: string; emoji: string; desc: string }[] = [
  { type: 'wave', label: '音浪', emoji: '🌊', desc: '随音乐起伏的波浪' },
  { type: 'particle', label: '粒子', emoji: '✨', desc: '舞动的星光粒子' },
  { type: 'aurora', label: '极光', emoji: '🌌', desc: '梦幻极光' },
  { type: 'vinyl', label: '唱片', emoji: '💿', desc: '经典黑胶风格' },
  { type: 'nebula', label: '星云', emoji: '🌠', desc: '绚烂星云' },
  { type: 'firefly', label: '萤火', emoji: '🪲', desc: '静谧萤火虫' }
]
</script>

<template>
  <div class="scene-selector">
    <button class="selector-trigger" title="切换场景">
      🌈
    </button>
    <div class="scene-menu">
      <button
        v-for="scene in scenes"
        :key="scene.type"
        :class="['scene-btn', { active: theme.currentScene === scene.type }]"
        @click="theme.setScene(scene.type)"
        :title="scene.desc"
      >
        <span class="scene-emoji">{{ scene.emoji }}</span>
        <span class="scene-label">{{ scene.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.scene-selector {
  position: relative;
}

.selector-trigger {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.selector-trigger:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--scene-accent);
}

.scene-menu {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 8px;
  gap: 4px;
  z-index: 300;
  backdrop-filter: blur(20px);
  min-width: 140px;
}

.scene-selector:hover .scene-menu {
  display: flex;
  flex-wrap: wrap;
}

.scene-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  width: 100%;
}

.scene-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.scene-btn.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--scene-accent);
  color: var(--scene-accent);
}

.scene-emoji {
  font-size: 16px;
}

@media (max-width: 768px) {
  .scene-menu {
    right: auto;
    left: 0;
  }
}
</style>
