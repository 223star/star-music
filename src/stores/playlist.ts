import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Track, Playlist } from '@/types'
import { generateId } from '@/utils/time'

const STORAGE_KEY = 'music-app-playlists'

function loadPlaylists(): Playlist[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
}

export const usePlaylistStore = defineStore('playlist', () => {
  const playlists = ref<Playlist[]>(loadPlaylists())
  const currentPlaylistId = ref<string>('')

  const currentPlaylist = computed(() =>
    playlists.value.find(p => p.id === currentPlaylistId.value)
  )

  const defaultPlaylist = computed(() => {
    let pl = playlists.value.find(p => p.name === '默认歌单')
    if (!pl) {
      pl = { id: generateId(), name: '默认歌单', tracks: [], createdAt: Date.now(), updatedAt: Date.now() }
      playlists.value.push(pl)
      savePlaylists(playlists.value)
    }
    return pl
  })

  // 创建歌单
  function createPlaylist(name: string): Playlist {
    const pl: Playlist = {
      id: generateId(),
      name,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    playlists.value.push(pl)
    savePlaylists(playlists.value)
    return pl
  }

  // 删除歌单
  function deletePlaylist(id: string) {
    playlists.value = playlists.value.filter(p => p.id !== id)
    if (currentPlaylistId.value === id) {
      currentPlaylistId.value = ''
    }
    savePlaylists(playlists.value)
  }

  // 重命名
  function renamePlaylist(id: string, name: string) {
    const pl = playlists.value.find(p => p.id === id)
    if (pl) {
      pl.name = name
      pl.updatedAt = Date.now()
      savePlaylists(playlists.value)
    }
  }

  // 添加歌曲到歌单
  function addToPlaylist(playlistId: string, track: Track) {
    // 先找默认歌单
    const pl = playlists.value.find(p => p.id === playlistId) || defaultPlaylist.value
    if (!pl) return

    // 去重
    if (pl.tracks.some(t => t.id === track.id && t.source === track.source)) return
    pl.tracks.push(track)
    pl.updatedAt = Date.now()
    savePlaylists(playlists.value)
  }

  // 从歌单移除歌曲
  function removeFromPlaylist(playlistId: string, trackIndex: number) {
    const pl = playlists.value.find(p => p.id === playlistId)
    if (pl) {
      pl.tracks.splice(trackIndex, 1)
      pl.updatedAt = Date.now()
      savePlaylists(playlists.value)
    }
  }

  // 选择当前歌单
  function selectPlaylist(id: string) {
    currentPlaylistId.value = id
  }

  // 从所有歌单中移除（删除时用）
  function removeTrackFromAll(trackId: string) {
    for (const pl of playlists.value) {
      pl.tracks = pl.tracks.filter(t => t.id !== trackId)
    }
    savePlaylists(playlists.value)
  }

  return {
    playlists, currentPlaylistId, currentPlaylist, defaultPlaylist,
    createPlaylist, deletePlaylist, renamePlaylist,
    addToPlaylist, removeFromPlaylist, selectPlaylist,
    removeTrackFromAll
  }
})