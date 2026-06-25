<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { MoodType } from '@/types'

const theme = useThemeStore()

const moods: { mood: MoodType; label: string; emoji: string }[] = [
  { mood: 'happy', label: '开心', emoji: '😊' },
  { mood: 'sad', label: '难过', emoji: '😢' },
  { mood: 'calm', label: '平静', emoji: '😌' },
  { mood: 'energetic', label: '活力', emoji: '⚡' },
  { mood: 'romantic', label: '浪漫', emoji: '🥰' },
  { mood: 'melancholy', label: '忧郁', emoji: '🌧️' },
  { mood: 'random', label: '随机', emoji: '🎲' },
]

const open = ref(false)
</script>

<template>
  <div class="mood" @mouseenter="open = true" @mouseleave="open = false">
    <button class="trigger">
      {{ moods.find(m => m.mood === theme.currentMood)?.emoji || '🎵' }}
    </button>
    <Transition name="pop">
      <div v-if="open" class="menu">
        <div class="menu-title">心情</div>
        <div class="grid">
          <button v-for="m in moods" :key="m.mood" :class="['btn', { active: theme.currentMood === m.mood }]" @click="theme.setMood(m.mood); open = false">
            <span class="emoji">{{ m.emoji }}</span>
            <span class="label">{{ m.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mood { position: relative; }
.trigger { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: none; border: none; font-size: 18px; cursor: pointer; transition: all var(--transition); }
.trigger:hover { background: var(--bg-hover); }
.menu { position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: rgba(18,18,30,0.98); border: 1px solid var(--border); border-radius: 14px; padding: 12px; z-index: 300; backdrop-filter: blur(20px); min-width: 200px; box-shadow: var(--shadow); }
.menu-title { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; text-align: center; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.btn { display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: 1px solid transparent; color: var(--text-secondary); padding: 6px 4px; border-radius: 8px; cursor: pointer; font-size: 11px; transition: all var(--transition); }
.btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.btn.active { background: var(--accent-dim); border-color: var(--border-active); color: var(--accent); }
.emoji { font-size: 18px; }
.pop-enter-active, .pop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) { .menu { left: auto; right: 0; transform: none; } }
</style>