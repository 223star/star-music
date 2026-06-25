<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const lyricContainerRef = ref<HTMLElement | null>(null)

// 高亮行索引
const highlightIndex = computed(() => player.currentLyricIndex)

// 上一行和下一行（用于动效过渡）
const prevHighlight = ref(-1)

watch(highlightIndex, (newIdx, oldIdx) => {
  prevHighlight.value = oldIdx
  // 自动滚动到高亮行
  if (lyricContainerRef.value && newIdx >= 0) {
    const el = lyricContainerRef.value.querySelector(`[data-lyric-idx="${newIdx}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})

// 歌词动效类
function getLyricClass(index: number): string {
  const effect = player.lyricEffect
  const isHighlight = index === highlightIndex.value
  const isPrev = index === prevHighlight.value

  let cls = 'lyric-line'
  if (isHighlight) cls += ' active'
  if (isPrev) cls += ' prev-active'

  switch (effect) {
    case 'scroll':
      cls += ' lyric-scroll'
      if (isHighlight) cls += ' scale-up'
      break
    case 'karaoke':
      cls += ' lyric-karaoke'
      break
    case 'wave':
      cls += ' lyric-wave'
      if (isHighlight) cls += ' lyric-wave-active'
      break
    case 'typewriter':
      cls += ' lyric-typewriter'
      break
    case 'glow':
      cls += ' lyric-glow'
      if (isHighlight) cls += ' glow-active'
      break
    case 'bounce':
      cls += ' lyric-bounce'
      if (isHighlight) cls += ' bounce-active'
      break
  }
  return cls
}

// 卡拉OK特效：逐字高亮进度
function getKaraokeStyle(index: number): { backgroundSize: string } | null {
  if (index !== highlightIndex.value || player.lyricEffect !== 'karaoke') return null
  if (!player.lyrics.length || index < 0) return null

  const currentLine = player.lyrics[index]
  const nextLine = player.lyrics[index + 1]
  if (!nextLine) return { backgroundSize: '100% 100%' }

  const lineDuration = nextLine.time - currentLine.time
  if (lineDuration <= 0) return { backgroundSize: '100% 100%' }

  const elapsed = player.currentTime - currentLine.time
  const progress = Math.min(1, Math.max(0, elapsed / lineDuration))
  return { backgroundSize: `${progress * 100}% 100%` }
}
</script>

<template>
  <div class="lyric-scroller" ref="lyricContainerRef">
    <!-- 歌词效果切换 -->
    <div class="effect-selector">
      <button
        v-for="effect in (['scroll', 'karaoke', 'wave', 'typewriter', 'glow', 'bounce'] as const)"
        :key="effect"
        :class="['effect-btn', { active: player.lyricEffect === effect }]"
        @click="player.setLyricEffect(effect)"
      >
        {{
          effect === 'scroll' ? '📜 滚动' :
          effect === 'karaoke' ? '🎤 卡拉OK' :
          effect === 'wave' ? '🌊 波浪' :
          effect === 'typewriter' ? '⌨️ 打字机' :
          effect === 'glow' ? '✨ 发光' : '💃 跳动'
        }}
      </button>
    </div>

    <!-- 歌词列表 -->
    <div class="lyric-list" v-if="player.lyrics.length > 0">
      <div
        v-for="(line, index) in player.lyrics"
        :key="index"
        :data-lyric-idx="index"
        :class="getLyricClass(index)"
        :style="getKaraokeStyle(index) || {}"
      >
        <span class="lyric-text">{{ line.text }}</span>
        <!-- 卡拉OK进度条遮罩 -->
        <span v-if="player.lyricEffect === 'karaoke' && index === highlightIndex" class="karaoke-overlay" :style="getKaraokeStyle(index) || {}">
          {{ line.text }}
        </span>
      </div>
    </div>

    <!-- 无歌词时的状态 -->
    <div v-else-if="player.currentTrack" class="no-lyric">
      <div class="no-lyric-icon">🎶</div>
      <div>暂无歌词</div>
      <div class="no-lyric-sub">享受音乐吧</div>
    </div>

    <!-- 未播放时 -->
    <div v-else class="no-lyric">
      <div class="no-lyric-icon">🎵</div>
      <div>选择一首歌开始</div>
    </div>
  </div>
</template>

<style scoped>
.lyric-scroller {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.effect-selector {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  overflow-x: auto;
  flex-shrink: 0;
}

.effect-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--card-border);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.effect-btn.active {
  background: var(--scene-accent);
  color: white;
  border-color: var(--scene-accent);
  opacity: 0.9;
}

.lyric-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  scroll-behavior: smooth;
}

.lyric-line {
  padding: 6px 16px;
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  cursor: default;
}

.lyric-text {
  font-size: 14px;
  color: var(--lyric-color);
  transition: all 0.3s;
}

/* 基础高亮 */
.active .lyric-text {
  color: var(--lyric-highlight);
  font-weight: 600;
}

/* 滚动模式 */
.lyric-scroll {
  transform: scale(1);
  opacity: 0.5;
  transition: all 0.4s;
}
.lyric-scroll.active {
  transform: scale(1.15);
  opacity: 1;
}
.lyric-scroll.active.scale-up {
  text-shadow: 0 0 20px var(--scene-accent);
}

/* 卡拉OK模式 */
.lyric-karaoke {
  position: relative;
}
.lyric-karaoke.active {
  background: linear-gradient(90deg, var(--scene-accent), var(--scene-accent));
  background-repeat: no-repeat;
  background-size: 0% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: var(--lyric-color);
  transition: background-size 0.1s linear;
}

/* 波浪模式 */
.lyric-wave {
  transition: transform 0.2s, opacity 0.3s;
}
.lyric-wave.active {
  color: var(--lyric-highlight);
}

/* 打字机模式 */
.lyric-typewriter {
  overflow: hidden;
  white-space: nowrap;
}
.lyric-typewriter.active {
  border-right: 2px solid var(--scene-accent);
  animation: typewriter-cursor 0.8s step-end infinite;
  max-width: fit-content;
  margin: 0 auto;
}

/* 发光模式 */
.lyric-glow {
  transition: text-shadow 0.3s;
}
.lyric-glow.active.glow-active .lyric-text {
  text-shadow:
    0 0 10px var(--scene-accent),
    0 0 20px var(--scene-accent),
    0 0 40px var(--scene-glow);
  color: var(--lyric-highlight);
}

/* 跳动模式 */
.lyric-bounce {
  transition: transform 0.2s;
}
.lyric-bounce.active.bounce-active {
  animation: lyric-bounce 0.4s ease-in-out 2;
}

/* 无歌词状态 */
.no-lyric {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  gap: 8px;
}

.no-lyric-icon {
  font-size: 48px;
  opacity: 0.3;
}

.no-lyric-sub {
  font-size: 12px;
  opacity: 0.5;
}

/* 响应式 */
@media (max-width: 768px) {
  .lyric-list {
    padding: 12px;
  }
  .lyric-text {
    font-size: 13px;
  }
}
</style>