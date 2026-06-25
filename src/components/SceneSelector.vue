<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { SceneType } from '@/types'

const theme = useThemeStore()

const scenes: { type: SceneType; label: string; emoji: string }[] = [
  { type: 'wave', label: '音浪', emoji: '🌊' },
  { type: 'particle', label: '粒子', emoji: '✨' },
  { type: 'aurora', label: '极光', emoji: '🌌' },
  { type: 'vinyl', label: '唱片', emoji: '💿' },
  { type: 'nebula', label: '星云', emoji: '🌠' },
  { type: 'firefly', label: '萤火', emoji: '🪲' },
]

const open = ref(false)
</script>

<template>
  <div class="scene" @mouseenter="open = true" @mouseleave="open = false">
    <button class="trigger">
      {{ scenes.find(s => s.type === theme.currentScene)?.emoji || '🌊' }}
    </button>
    <Transition name="pop">
      <div v-if="open" class="menu">
        <div class="menu-title">场景</div>
        <div class="grid">
          <button v-for="s in scenes" :key="s.type" :class="['btn', { active: theme.currentScene === s.type }]" @click="theme.setScene(s.type); open = false">
            <span class="emoji">{{ s.emoji }}</span>
            <span class="label">{{ s.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scene { position: relative; }
.trigger { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: none; border: none; font-size: 18px; cursor: pointer; transition: all var(--transition); }
.trigger:hover { background: var(--bg-hover); }
.menu { position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: rgba(18,18,30,0.98); border: 1px solid var(--border); border-radius: 14px; padding: 12px; z-index: 300; backdrop-filter: blur(20px); min-width: 180px; box-shadow: var(--shadow); }
.menu-title { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; text-align: center; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.btn { display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: 1px solid transparent; color: var(--text-secondary); padding: 6px 4px; border-radius: 8px; cursor: pointer; font-size: 11px; transition: all var(--transition); }
.btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.btn.active { background: var(--accent-dim); border-color: var(--border-active); color: var(--accent); }
.emoji { font-size: 18px; }
.pop-enter-active, .pop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) { .menu { left: auto; right: 0; transform: none; } }
</style>