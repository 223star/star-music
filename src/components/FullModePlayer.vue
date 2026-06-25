<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { formatTime } from '@/utils/time'
import LyricScrollerVue from './LyricScroller.vue'
import AudioVisualizer from './AudioVisualizer.vue'

const player = usePlayerStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="player.showFullPlayer" class="full-player-overlay" @click.self="player.toggleFullPlayer()">
        <div class="full-player">
          <!-- 左上角返回 -->
          <button class="back-btn" @click="player.toggleFullPlayer()">
            ▼ 收起
          </button>

          <div class="full-layout">
            <!-- 左半：专辑封面 + 可视化 -->
            <div class="full-left">
              <div class="album-art">
                <img :src="player.currentTrack?.cover" alt="" class="album-cover" />
                <div class="album-glow"></div>
              </div>

              <!-- 歌曲信息 -->
              <div class="full-track-info">
                <div class="full-title">{{ player.currentTrack?.title }}</div>
                <div class="full-artist">{{ player.currentTrack?.artist }}</div>
              </div>

              <!-- 可视化 -->
              <AudioVisualizer />
            </div>

            <!-- 右半：歌词 -->
            <div class="full-right">
              <LyricScrollerVue />

              <!-- 进度条 -->
              <div class="full-progress">
                <span class="time">{{ formatTime(player.currentTime) }}</span>
                <input
                  type="range"
                  class="progress-bar"
                  :min="0"
                  :max="player.duration || 0"
                  :value="player.currentTime"
                  @input="(e) => player.seek(parseFloat((e.target as HTMLInputElement).value))"
                />
                <span class="time">{{ formatTime(player.duration) }}</span>
              </div>

              <!-- 底部控制 -->
              <div class="full-actions">
                <button class="action-btn" @click="player.cyclePlayMode()">
                  {{ player.playMode === 'sequential' ? '🔁' : player.playMode === 'shuffle' ? '🔀' : '🔂' }}
                </button>
                <button class="action-btn" @click="player.prevTrack()">⏮</button>
                <button class="action-btn big" @click="player.togglePlay()">
                  {{ player.isPlaying ? '⏸' : '▶️' }}
                </button>
                <button class="action-btn" @click="player.nextTrack()">⏭</button>
                <button class="action-btn" @click="player.setLyricEffect(player.lyricEffect === 'scroll' ? 'karaoke' : 'scroll')">
                  🎤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.full-player-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: var(--scene-bg);
  animation: fadeIn 0.3s ease;
}

.full-player {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 20px;
  z-index: 10;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--scene-accent);
}

.full-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左半 */
.full-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px;
  position: relative;
}

.album-art {
  position: relative;
  width: 280px;
  height: 280px;
}

.album-cover {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.album-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, var(--scene-glow), transparent 70%);
  border-radius: 50%;
  z-index: -1;
  animation: glow 3s ease-in-out infinite alternate;
}

.full-track-info {
  text-align: center;
}

.full-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.full-artist {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 右半 */
.full-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;
}

.full-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
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
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--scene-accent);
  cursor: pointer;
}

.full-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
}

.action-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1;
  background: rgba(255,255,255,0.1);
}

.action-btn.big {
  font-size: 36px;
  opacity: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .full-layout {
    flex-direction: column;
  }
  .full-left {
    padding: 20px;
    flex: none;
  }
  .album-art {
    width: 180px;
    height: 180px;
  }
  .full-title {
    font-size: 18px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes glow {
  from { opacity: 0.5; transform: scale(1); }
  to { opacity: 1; transform: scale(1.1); }
}
</style>
