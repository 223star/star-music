<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const container = ref<HTMLElement | null>(null)

const highlightIndex = computed(() => player.currentLyricIndex)

watch(highlightIndex, () => {
  if (container.value && highlightIndex.value >= 0) {
    const el = container.value.querySelector(`[data-i="${highlightIndex.value}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})

function lineClass(i: number) {
  const effect = player.lyricEffect
  const hl = i === highlightIndex.value
  let cls = 'line'
  if (hl) cls += ' active'
  if (effect === 'karaoke' && hl) cls += ' karaoke'
  if (effect === 'glow' && hl) cls += ' glow'
  if (effect === 'wave' && hl) cls += ' wave'
  return cls
}
</script>

<template>
  <div class="lyrics">
    <div class="effects">
      <button v-for="e in [{k:'scroll',l:'滚动'},{k:'karaoke',l:'卡拉OK'},{k:'wave',l:'波浪'},{k:'glow',l:'发光'},{k:'bounce',l:'跳动'}]" :key="e.k" :class="['eff', { active: player.lyricEffect === e.k }]" @click="player.setLyricEffect(e.k as any)">{{ e.l }}</button>
    </div>
    <div class="stage" ref="container">
      <template v-if="player.lyrics.length">
        <div v-for="(line, i) in player.lyrics" :key="i" :data-i="i" :class="lineClass(i)">
          <span class="text">{{ line.text }}</span>
          <span v-if="player.lyricEffect === 'karaoke' && i === highlightIndex" class="karaoke-fill">{{ line.text }}</span>
        </div>
      </template>
      <div v-else class="empty">
        <div class="empty-icon">🎶</div>
        <div class="empty-text">{{ player.currentTrack ? '暂无歌词' : '选择一首歌开始' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lyrics { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.effects { display: flex; gap: 4px; padding: 8px 16px; overflow-x: auto; flex-shrink: 0; }
.eff { background: rgba(255,255,255,0.04); border: none; color: var(--text-muted); padding: 4px 10px; border-radius: 16px; font-size: 11px; cursor: pointer; white-space: nowrap; transition: all var(--transition); }
.eff.active { background: var(--accent-dim); color: var(--accent); }
.stage { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
.line { padding: 6px 16px; border-radius: 8px; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); text-align: center; position: relative; }
.text { font-size: 14px; color: var(--text-muted); transition: all 0.3s; }
.active .text { color: #fff; font-weight: 600; font-size: 16px; }
.glow.active .text { text-shadow: 0 0 10px var(--accent), 0 0 30px var(--accent-glow); }
.wave.active { animation: lyric-wave 0.3s ease-in-out; }
.karaoke.active { background: linear-gradient(90deg, var(--accent), var(--accent)); background-repeat: no-repeat; background-size: 0% 100%; background-clip: text; -webkit-background-clip: text; color: var(--text-muted); transition: background-size 0.1s linear; }
@keyframes lyric-wave { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 8px; }
.empty-icon { font-size: 40px; opacity: 0.2; }
.empty-text { font-size: 13px; color: var(--text-muted); }

@media (max-width: 768px) { .stage { padding: 12px; } .text { font-size: 13px; } .active .text { font-size: 15px; } }
</style>