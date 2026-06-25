<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'

const player = usePlayerStore()
const playlistStore = usePlaylistStore()

const activeTab = ref<'playlist' | 'search'>('playlist')

function playTrack(track: any) { player.setQueue([track]) }

function addToPlaylist(track: any) {
  const pl = playlistStore.defaultPlaylist
  if (pl) playlistStore.addToPlaylist(pl.id, track)
}

function removeTrack(index: number) {
  const pl = playlistStore.currentPlaylist
  if (pl) playlistStore.removeFromPlaylist(pl.id, index)
}

function playFromPlaylist(index: number) {
  const pl = playlistStore.currentPlaylist
  if (pl) player.setQueue(pl.tracks, index)
}
</script>

<template>
  <div class="track-list">
    <!-- 搜索提示 -->
    <div v-if="playlistStore.playlists.length === 0 && !playlistStore.currentPlaylist?.tracks.length" class="welcome">
      <div class="welcome-icon">✦</div>
      <h2 class="welcome-title">star-music</h2>
      <p class="welcome-desc">在上方搜索歌曲，收藏到歌单开始播放</p>
      <div class="welcome-tips">
        <div class="tip"><span>🔍</span> 搜索网易云 / QQ 音乐</div>
        <div class="tip"><span>📋</span> 收藏喜欢的歌曲</div>
        <div class="tip"><span>🎤</span> 同步滚动歌词</div>
        <div class="tip"><span>💬</span> 弹幕互动</div>
      </div>
    </div>

    <!-- 歌单 Tab -->
    <div v-else>
      <div class="playlist-header">
        <div class="playlist-name">{{ playlistStore.currentPlaylist?.name || '默认歌单' }}</div>
        <div class="playlist-actions">
          <button class="mini-btn" @click="playlistStore.createPlaylist('新歌单 ' + (playlistStore.playlists.length + 1))">+ 新建</button>
        </div>
      </div>

      <!-- 歌单切换 -->
      <div class="pl-tabs" v-if="playlistStore.playlists.length > 1">
        <button v-for="pl in playlistStore.playlists" :key="pl.id" class="pl-tab" :class="{ active: playlistStore.currentPlaylistId === pl.id }" @click="playlistStore.selectPlaylist(pl.id)">
          {{ pl.name }}
          <span class="pl-count">{{ pl.tracks.length }}</span>
        </button>
      </div>

      <div class="list">
        <div v-if="!playlistStore.currentPlaylist?.tracks.length" class="empty">
          <p>歌单是空的</p>
          <p class="sub">搜索歌曲点击 ➕ 收藏</p>
        </div>

        <div v-for="(track, index) in playlistStore.currentPlaylist?.tracks || []" :key="track.id + index" :class="['item', { active: player.currentTrack?.id === track.id && player.currentTrack?.source === track.source }]" @click="playFromPlaylist(index)">
          <img :src="track.cover" class="item-cover" alt="" loading="lazy" />
          <div class="item-meta">
            <div class="item-title">{{ track.title }}</div>
            <div class="item-artist">{{ track.artist }}</div>
          </div>
          <span :class="['src-badge', track.source]">{{ track.source === 'netease' ? '网易云' : 'QQ' }}</span>
          <button class="add-btn" @click.stop="removeTrack(index)" title="移出歌单">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track-list { height: 100%; }

/* 欢迎页 */
.welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 8px; text-align: center; padding: 40px 20px; }
.welcome-icon { font-size: 48px; color: var(--text-muted); margin-bottom: 8px; }
.welcome-title { font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.welcome-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
.welcome-tips { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); background: var(--bg-card); padding: 8px 14px; border-radius: 8px; }

/* 歌单头 */
.playlist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.playlist-name { font-size: 15px; font-weight: 600; }
.mini-btn { background: var(--accent-dim); border: none; color: var(--accent); padding: 6px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all var(--transition); }
.mini-btn:hover { background: rgba(99,102,241,0.25); }

.pl-tabs { display: flex; gap: 4px; margin-bottom: 12px; overflow-x: auto; }
.pl-tab { background: var(--bg-card); border: 1px solid transparent; color: var(--text-secondary); padding: 6px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; white-space: nowrap; transition: all var(--transition); }
.pl-tab.active { background: var(--accent-dim); border-color: var(--border-active); color: var(--accent); }
.pl-count { margin-left: 6px; opacity: 0.5; font-size: 11px; }

/* 列表 */
.list { display: flex; flex-direction: column; gap: 2px; }
.empty { text-align: center; padding: 48px 20px; color: var(--text-secondary); font-size: 13px; }
.sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
.item:hover { background: var(--bg-hover); }
.item.active { background: var(--accent-dim); }
.item-cover { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.item-meta { flex: 1; min-width: 0; }
.item-title { font-size: 13px; font-weight: 500; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-artist { font-size: 11px; color: var(--text-secondary); margin-top: 1px; }
.src-badge { font-size: 10px; padding: 2px 7px; border-radius: 4px; flex-shrink: 0; }
.src-badge.netease { background: rgba(212,52,35,0.12); color: #d43423; }
.src-badge.qqmusic { background: rgba(0,202,77,0.12); color: #00ca4d; }
.add-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; transition: all var(--transition); }
.add-btn:hover { color: #ff6b6b; background: rgba(255,107,107,0.1); }
</style>