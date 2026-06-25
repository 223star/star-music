<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { formatTime } from '@/utils/time'

const player = usePlayerStore()

function onSeek(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  player.seek(val)
}

function onVolume(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  player.setVolume(val)
}

function getPlayModeIcon(): string {
  const map = { sequential: '🔁', shuffle: '🔀', 'repeat-one': '🔂' }
  return map[player.playMode]
}
</script>

<template>
  <div class="player-controls" v-if="player.currentTrack">
    <!-- 可视化背景条 -->
    <div class="visualizer-bar">
      <div
        v-for="(val, i) in Array.from(player.frequencyData).slice(0, 64)"
        :key="i"
        class="bar"
        :style="{ height: Math.max(2, val / 3) + 'px' }"
      ></div>
    </div>

    <div class="controls-content">
      <!-- 歌曲信息 -->
      <div class="track-info" @click="player.toggleFullPlayer()">
        <img :src="player.currentTrack?.cover" class="cover" alt="" />
        <div class="info">
          <div class="title">{{ player.currentTrack?.title }}</div>
          <div class="artist">{{ player.currentTrack?.artist }}</div>
        </div>
      </div>

      <!-- 播放控制 -->
      <div class="play-controls">
        <button class="ctrl-btn" @click="player.cyclePlayMode()" :title="'播放模式: ' + player.playMode">
          {{ getPlayModeIcon() }}
        </button>
        <button class="ctrl-btn" @click="player.prevTrack()">⏮</button>
        <button class="ctrl-btn play-btn" @click="player.togglePlay()">
          {{ player.isPlaying ? '⏸' : '▶️' }}
        </button>
        <button class="ctrl-btn" @click="player.nextTrack()">⏭</button>
      </div>

      <!-- 进度条 -->
      <div class="progress-area">
        <span class="time">{{ formatTime(player.currentTime) }}</span>
        <input
          type="range"
          class="progress-bar"
          :min="0"
          :max="player.duration || 0"
          :value="player.currentTime"
          @input="onSeek"
        />
        <span class="time">{{ formatTime(player.duration) }}</span>
      </div>

      <!-- 歌词动效切换 -->
      <div class="extra-controls">
        <button
          v-for="effect in (['scroll', 'karaoke', 'wave', 'glow'] as const)"
          :key="effect"
          :class="['effect-btn', { active: player.lyricEffect === effect }]"
          @click="player.setLyricEffect(effect)"
          :title="'歌词: ' + effect"
        >
          {{ effect === 'scroll' ? '📜' : effect === 'karaoke' ? '🎤' : effect === 'wave' ? '🌊' : '✨' }}
        </button>
      </div>

      <!-- 音量 -->
      <div class="volume-control">
        <span class="vol-icon">{{ player.volume > 0.5 ? '🔊' : player.volume > 0 ? '🔉' : '🔇' }}</span>
        <input
          type="range"
          class="volume-bar"
          min="0"
          max="1"
          step="0.01"
          :value="player.volume"
          @input="onVolume"
        />
      </div>
    </div>
  </div>

  <!-- 没有播放时 -->
  <div v-else class="player-controls idle">
    <div class="idle-text">🎵 搜索歌曲开始播放吧</div>
  </div>
</template>

<style scoped>
.player-controls {
  flex-shrink: 0;
  background: rgba(15, 15, 26, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--card-border);
  position: relative;
  z-index: 100;
}

.player-controls.idle {
  padding: 20px;
  text-align: center;
}

.idle-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.visualizer-bar {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 32px;
  padding: 0 4px;
  overflow: hidden;
}

.bar {
  flex: 1;
  background: var(--scene-accent);
  border-radius: 1px 1px 0 0;
  opacity: 0.3;
  transition: height 0.1s ease;
  min-width: 2px;
}

.controls-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 20px;
}

/* 歌曲信息 */
.track-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  max-width: 240px;
  cursor: pointer;
  flex-shrink: 0;
}

.cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.info {
  min-width: 0;
}

.title {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 播放按钮 */
.play-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ctrl-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  color: var(--text-primary);
  opacity: 0.7;
}

.ctrl-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.play-btn {
  font-size: 24px;
  opacity: 1;
}

/* 进度条 */
.progress-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.time {
  font-size: 11px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 36px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--card-border);
  outline: none;
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--scene-accent);
  cursor: pointer;
  transition: transform 0.2s;
}

.progress-bar::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

/* 歌词动效 */
.extra-controls {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.effect-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  opacity: 0.4;
  transition: all 0.2s;
}

.effect-btn.active {
  opacity: 1;
  background: rgba(99, 102, 241, 0.2);
}

/* 音量 */
.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vol-icon {
  font-size: 14px;
  opacity: 0.6;
}

.volume-bar {
  -webkit-appearance: none;
  appearance: none;
  width: 60px;
  height: 4px;
  border-radius: 2px;
  background: var(--card-border);
  outline: none;
  cursor: pointer;
}

.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-primary);
  cursor: pointer;
}

/* 响应式 */
@media (max-width: 768px) {
  .controls-content {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
  }
  .track-info {
    min-width: 120px;
    max-width: 160px;
  }
  .extra-controls, .volume-control {
    display: none;
  }
}
</style>