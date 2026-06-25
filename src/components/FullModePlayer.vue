<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { formatTime } from '@/utils/time'
import LyricScroller from './LyricScroller.vue'

const player = usePlayerStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="player.showFullPlayer" class="overlay" @click.self="player.toggleFullPlayer()">
        <div class="fullmode">
          <button class="close" @click="player.toggleFullPlayer()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            收起
          </button>

          <div class="layout">
            <!-- 左：封面 -->
            <div class="left">
              <div class="cover-art">
                <img :src="player.currentTrack?.cover" class="cover-img" :class="{ spin: player.isPlaying, 'spin-paused': !player.isPlaying }" alt="" />
                <div class="cover-ring"></div>
              </div>
              <div class="track-meta">
                <div class="track-title">{{ player.currentTrack?.title }}</div>
                <div class="track-artist">{{ player.currentTrack?.artist }}</div>
              </div>
              <div class="vis-placeholder">
                <div v-for="i in 32" :key="i" class="vis-dot" :style="{ opacity: 0.1 + Math.sin(Date.now()/1000 + i) * 0.05 }"></div>
              </div>
            </div>

            <!-- 右：歌词 + 控制 -->
            <div class="right">
              <LyricScroller />

              <div class="progress">
                <span class="time">{{ formatTime(player.currentTime) }}</span>
                <div class="progress-track">
                  <input type="range" class="progress-input" :min="0" :max="player.duration || 0" :value="player.currentTime" @input="(e) => player.seek(parseFloat((e.target as HTMLInputElement).value))" />
                  <div class="progress-bg"><div class="progress-fill" :style="{ width: (player.duration ? (player.currentTime/player.duration*100) : 0) + '%' }"></div></div>
                </div>
                <span class="time">{{ formatTime(player.duration) }}</span>
              </div>

              <div class="controls">
                <button class="ctrl" @click="player.cyclePlayMode()">{{ {sequential:'🔁', shuffle:'🔀', 'repeat-one':'🔂'}[player.playMode] }}</button>
                <button class="ctrl" @click="player.prevTrack()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
                </button>
                <button class="play" @click="player.togglePlay()">
                  <svg v-if="player.isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button class="ctrl" @click="player.nextTrack()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
                <button :class="['ctrl', { active: player.lyricEffect === 'karaoke' }]" @click="player.setLyricEffect(player.lyricEffect === 'scroll' ? 'karaoke' : 'scroll')">
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
.overlay { position: fixed; inset: 0; z-index: 999; background: var(--bg-primary); animation: fadeIn 0.3s ease; }
.fullmode { height: 100%; display: flex; flex-direction: column; }

.close {
  position: absolute; top: 16px; left: 20px; z-index: 10;
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-card); border: 1px solid var(--border);
  color: var(--text-secondary); padding: 8px 16px; border-radius: 20px;
  font-size: 13px; cursor: pointer; transition: all var(--transition);
}
.close:hover { background: var(--bg-hover); color: var(--text-primary); }

.layout { flex: 1; display: flex; overflow: hidden; }
.left { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 40px; }
.cover-art { position: relative; width: 260px; height: 260px; }
.cover-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; box-shadow: 0 16px 48px rgba(0,0,0,0.5); }
.cover-ring { position: absolute; inset: -8px; border-radius: 50%; border: 1px solid var(--border); opacity: 0.3; }
.track-meta { text-align: center; }
.track-title { font-size: 22px; font-weight: 700; color: #fff; }
.track-artist { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
.vis-placeholder { display: flex; gap: 4px; align-items: center; height: 12px; }
.vis-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); transition: opacity 0.3s; }

.right { flex: 1; display: flex; flex-direction: column; padding: 24px; }
.progress { display: flex; align-items: center; gap: 12px; padding: 16px 0; }
.time { font-size: 11px; font-variant-numeric: tabular-nums; color: var(--text-muted); min-width: 36px; text-align: center; }
.progress-track { flex: 1; position: relative; height: 4px; cursor: pointer; }
.progress-input { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; z-index: 2; }
.progress-bg { position: absolute; inset: 0; border-radius: 2px; background: rgba(255,255,255,0.06); overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; background: var(--accent); transition: width 0.1s linear; }

.controls { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px 0; }
.ctrl { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px; transition: all var(--transition); }
.ctrl:hover { background: var(--bg-hover); color: var(--text-primary); }
.ctrl.active { background: var(--accent-dim); color: var(--accent); }
.play { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: var(--accent); border: none; color: #fff; cursor: pointer; transition: all var(--transition); }
.play:hover { transform: scale(1.05); box-shadow: 0 0 30px var(--accent-glow); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 768px) {
  .layout { flex-direction: column; }
  .left { padding: 20px; flex: none; }
  .cover-art { width: 180px; height: 180px; }
  .track-title { font-size: 18px; }
}
</style>