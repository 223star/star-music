import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Track, LyricLine, PlayMode, LyricEffect, LyricStyle } from '@/types'
import { connectAudioElement, resumeContext, getFrequencyData, closeContext } from '@/utils/audio'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref<Track | null>(null)
  const queue = ref<Track[]>([])
  const queueIndex = ref(-1)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const playMode = ref<PlayMode>('sequential')
  const lyrics = ref<LyricLine[]>([])
  const currentLyricIndex = ref(-1)
  const frequencyData = ref<Uint8Array>(new Uint8Array(128))
  const showFullPlayer = ref(false)

  // 歌词动效模式
  const lyricEffect = ref<LyricEffect>('scroll')
  const lyricStyle = ref<LyricStyle>({
    effect: 'scroll',
    fontSize: 28,
    color: '#8888aa',
    highlightColor: '#ffffff',
    alignment: 'center'
  })

  let audioElement: HTMLAudioElement | null = null
  let animationFrameId: number | null = null

  // 更新频率数据的动画循环
  function startFrequencyLoop() {
    const update = () => {
      if (isPlaying.value) {
        frequencyData.value = getFrequencyData()
      }
      animationFrameId = requestAnimationFrame(update)
    }
    animationFrameId = requestAnimationFrame(update)
  }

  function stopFrequencyLoop() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 初始化音频元素
  function initAudio() {
    if (audioElement) return
    audioElement = new Audio()
    audioElement.volume = volume.value

    audioElement.addEventListener('timeupdate', () => {
      currentTime.value = audioElement!.currentTime
      updateLyricIndex()
    })

    audioElement.addEventListener('loadedmetadata', () => {
      duration.value = audioElement!.duration || 0
    })

    audioElement.addEventListener('ended', () => {
      nextTrack()
    })

    audioElement.addEventListener('play', () => {
      isPlaying.value = true
      startFrequencyLoop()
    })

    audioElement.addEventListener('pause', () => {
      isPlaying.value = false
      stopFrequencyLoop()
    })

    audioElement.addEventListener('error', (e) => {
      console.error('音频播放错误:', e)
      isPlaying.value = false
    })
  }

  // 更新当前歌词索引
  function updateLyricIndex() {
    if (!lyrics.value.length) return
    const time = currentTime.value
    let idx = -1
    for (let i = lyrics.value.length - 1; i >= 0; i--) {
      if (time >= lyrics.value[i].time) {
        idx = i
        break
      }
    }
    currentLyricIndex.value = idx
  }

  // 播放指定歌曲
  async function playTrack(track: Track) {
    initAudio()
    if (!audioElement) return

    // 寻找或拼接音频URL
    let audioUrl: string | null = track.audioUrl ?? null
    if (!audioUrl) {
      try {
        const res = await fetch(`/api/stream?bvid=${track.id}&source=${track.source}`)
        const data = await res.json()
        audioUrl = data.audioUrl ?? null
      } catch (err) {
        console.error('获取音频流失败:', err)
        return
      }
    }
    if (!audioUrl) {
      console.error('无法获取音频流')
      return
    }

    audioElement.src = audioUrl
    audioElement.currentTime = 0
    currentTime.value = 0
    currentTrack.value = track

    // 连接到 Web Audio API
    try {
      connectAudioElement(audioElement)
    } catch (e) {
      console.warn('Web Audio 连接失败，使用普通播放:', e)
    }

    // 获取歌词
    fetchLyrics(track)

    // 播放
    try {
      resumeContext()
      await audioElement.play()
    } catch (err) {
      console.error('播放失败:', err)
    }
  }

  // 获取歌词
  async function fetchLyrics(track: Track) {
    try {
      const res = await fetch(`/api/lyrics?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`)
      const data = await res.json()
      lyrics.value = data.lyrics || []
      currentLyricIndex.value = -1
    } catch (err) {
      console.error('获取歌词失败:', err)
      lyrics.value = []
    }
  }

  // 播放控制
  function togglePlay() {
    if (!audioElement || !currentTrack.value) return
    if (isPlaying.value) {
      audioElement.pause()
    } else {
      resumeContext()
      audioElement.play()
    }
  }

  function pause() {
    if (audioElement && isPlaying.value) {
      audioElement.pause()
    }
  }

  function seek(time: number) {
    if (audioElement) {
      audioElement.currentTime = time
      currentTime.value = time
    }
  }

  function setVolume(v: number) {
    volume.value = v
    if (audioElement) {
      audioElement.volume = v
    }
  }

  // 下一首/上一首
  function nextTrack() {
    if (!queue.value.length) return
    let nextIdx: number
    if (playMode.value === 'shuffle') {
      nextIdx = Math.floor(Math.random() * queue.value.length)
    } else if (playMode.value === 'repeat-one') {
      nextIdx = queueIndex.value
    } else {
      nextIdx = (queueIndex.value + 1) % queue.value.length
    }
    queueIndex.value = nextIdx
    playTrack(queue.value[nextIdx])
  }

  function prevTrack() {
    if (!queue.value.length) return
    let prevIdx: number
    if (playMode.value === 'shuffle') {
      prevIdx = Math.floor(Math.random() * queue.value.length)
    } else {
      prevIdx = (queueIndex.value - 1 + queue.value.length) % queue.value.length
    }
    queueIndex.value = prevIdx
    playTrack(queue.value[prevIdx])
  }

  // 设置播放列表
  function setQueue(tracks: Track[], startIndex = 0) {
    queue.value = tracks
    queueIndex.value = startIndex
    playTrack(tracks[startIndex])
  }

  // 添加到队列
  function addToQueue(track: Track) {
    queue.value.push(track)
    if (queueIndex.value === -1) {
      queueIndex.value = 0
      playTrack(track)
    }
  }

  // 切换歌词动效
  function setLyricEffect(effect: LyricEffect) {
    lyricEffect.value = effect
    lyricStyle.value.effect = effect
  }

  function toggleFullPlayer() {
    showFullPlayer.value = !showFullPlayer.value
  }

  // 切歌
  function cyclePlayMode() {
    const modes: PlayMode[] = ['sequential', 'shuffle', 'repeat-one']
    const idx = modes.indexOf(playMode.value)
    playMode.value = modes[(idx + 1) % modes.length]
  }

  return {
    currentTrack, queue, queueIndex, isPlaying,
    currentTime, duration, volume, playMode,
    lyrics, currentLyricIndex, frequencyData,
    lyricEffect, lyricStyle, showFullPlayer,
    playTrack, togglePlay, pause, seek, setVolume,
    nextTrack, prevTrack, setQueue, addToQueue,
    setLyricEffect, toggleFullPlayer, cyclePlayMode
  }
})