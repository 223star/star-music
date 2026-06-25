<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { formatTime } from '@/utils/time'

const player = usePlayerStore()

function onSeek(e: Event) { player.seek(parseFloat((e.target as HTMLInputElement).value)) }
function onVol(e: Event) { player.setVolume(parseFloat((e.target as HTMLInputElement).value)) }

const modeIcon: Record<string, string> = { sequential: '🔁', shuffle: '🔀', 'repeat-one': '🔂' }
</script>

<template>
  <div :class="['bar', { idle: !player.currentTrack }]">
    <!-- 频谱条 -->
    <div class="visualizer" v-if="player.currentTrack">
      <div v-for="(v,i) in player.frequencyData.slice(0,60)" :key="i" class="vis-bar" :style="{ height: 2 + v/4 + 'px', opacity: 0.15 + v/255 * 0.5 }"></div>
    </div>

    <div class="bar-content" v-if="player.currentTrack">
      <!-- 左：封面+信息 -->
      <div class="track-info" @click="player.toggleFullPlayer()">
        <div class="cover-wrap">
          <img :src="player.currentTrack?.cover" class="cover" :class="{ spin: player.isPlaying, 'spin-paused': !player.isPlaying }" alt="" />
        </div>
        <div class="meta">
          <div class="title">{{ player.currentTrack?.title }}</div>
          <div class="artist">{{ player.currentTrack?.artist }}</div>
        </div>
      </div>

      <!-- 中：控制 -->
      <div class="center">
        <div class="play-controls">
          <button class="ctrl-btn" @click="player.cyclePlayMode()">{{ modeIcon[player.playMode] || '🔁' }}</button>
          <button class="ctrl-btn" @click="player.prevTrack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button class="play-btn" @click="player.togglePlay()">
            <svg v-if="player.isPlaying" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="ctrl-btn" @click="player.nextTrack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>
        <div class="progress">
          <span class="time">{{ formatTime(player.currentTime) }}</span>
          <div class="progress-track">
            <input type="range" class="progress-fill" :min="0" :max="player.duration || 0" :value="player.currentTime" @input="onSeek" />
            <div class="progress-bg"><div class="progress-done" :style="{ width: (player.duration ? (player.currentTime/player.duration*100) : 0) + '%' }"></div></div>
          </div>
          <span class="time">{{ formatTime(player.duration) }}</span>
        </div>
      </div>

      <!-- 右：音量和歌词动效 -->
      <div class="right">
        <div class="lyric-effects">
          <button :class="['eff-btn', { active: player.lyricEffect === 'scroll' }]" @click="player.setLyricEffect('scroll')" title="滚动">📜</button>
          <button :class="['eff-btn', { active: player.lyricEffect === 'karaoke' }]" @click="player.setLyricEffect('karaoke')" title="卡拉OK">🎤</button>
          <button :class="['eff-btn', { active: player.lyricEffect === 'glow' }]" @click="player.setLyricEffect('glow')" title="发光">✨</button>
        </div>
        <div class="volume">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
          <input type="range" class="vol-slider" min="0" max="1" step="0.01" :value="player.volume" @input="onVol" />
        </div>
      </div>
    </div>

    <div v-else class="bar-idle">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      <span>搜索歌曲开始播放</span>
    </div>
  </div>
</template>

<style scoped>
.bar { flex-shrink: 0; background: rgba(10,10,20,0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid var(--border); position: relative; z-index: 100; }
.bar.idle { padding: 16px 24px; }
.bar-idle { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 13px; justify-content: center; }

.visualizer { display: flex; align-items: flex-end; gap: 2px; height: 24px; padding: 0 4px; overflow: hidden; }
.vis-bar { flex: 1; background: var(--accent); border-radius: 1px; min-width: 2px; transition: height 0.08s; }

.bar-content { display: flex; align-items: center; gap: 16px; padding: 8px 20px; }

/* 左 */
.track-info { display: flex; align-items: center; gap: 10px; min-width: 160px; max-width: 220px; cursor: pointer; flex-shrink: 0; }
.cover-wrap { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.cover { width: 100%; height: 100%; object-fit: cover; }
.meta { min-width: 0; }
.title { font-size: 13px; font-weight: 500; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist { font-size: 11px; color: var(--text-secondary); margin-top: 1px; }

/* 中 */
.center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 200px; }
.play-controls { display: flex; align-items: center; gap: 4px; }
.ctrl-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: none; border: none; color: var(--text-secondary); cursor: pointer; transition: all var(--transition); font-size: 14px; }
.ctrl-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.play-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--accent); border: none; color: #fff; cursor: pointer; transition: all var(--transition); }
.play-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px var(--accent-glow); }

.progress { display: flex; align-items: center; gap: 8px; width: 100%; max-width: 400px; }
.time { font-size: 10px; font-variant-numeric: tabular-nums; color: var(--text-muted); min-width: 32px; text-align: center; }
.progress-track { flex: 1; position: relative; height: 4px; cursor: pointer; }
.progress-fill { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; z-index: 2; }
.progress-bg { position: absolute; inset: 0; border-radius: 2px; background: rgba(255,255,255,0.06); overflow: hidden; }
.progress-done { height: 100%; border-radius: 2px; background: var(--accent); transition: width 0.1s linear; }

/* 右 */
.right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.lyric-effects { display: flex; gap: 2px; }
.eff-btn { background: none; border: none; font-size: 12px; padding: 4px 6px; border-radius: 6px; cursor: pointer; opacity: 0.3; transition: all var(--transition); }
.eff-btn.active { opacity: 1; background: var(--accent-dim); }
.volume { display: flex; align-items: center; gap: 6px; color: var(--text-muted); }
.vol-slider { -webkit-appearance: none; appearance: none; width: 60px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.06); outline: none; cursor: pointer; }
.vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; }

@media (max-width: 768px) {
  .bar-content { padding: 8px 12px; gap: 8px; }
  .track-info { min-width: 100px; max-width: 140px; }
  .right .lyric-effects, .right .volume { display: none; }
  .center { min-width: 0; }
}
</style>