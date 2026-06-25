import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Track, LyricLine, PlayMode, LyricEffect } from '@/types'
import { connectAudioElement, resumeContext, getFrequencyData } from '@/utils/audio'
import { fetchLyrics } from '@/utils/api'

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
  const lyricEffect = ref<LyricEffect>('scroll')

  let audioElement: HTMLAudioElement | null = null
  let animFrame: number | null = null
  let audioConnected = false

  // 频率更新
  function startFreqLoop() {
    const update = () => {
      if (isPlaying.value) frequencyData.value = getFrequencyData()
      animFrame = requestAnimationFrame(update)
    }
    animFrame = requestAnimationFrame(update)
  }
  function stopFreqLoop() {
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }
  }

  // 初始化音频
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
    audioElement.addEventListener('ended', () => nextTrack())
    audioElement.addEventListener('play', () => { isPlaying.value = true; startFreqLoop() })
    audioElement.addEventListener('pause', () => { isPlaying.value = false; stopFreqLoop() })
    audioElement.addEventListener('error', () => { isPlaying.value = false })
  }

  function updateLyricIndex() {
    if (!lyrics.value.length) { currentLyricIndex.value = -1; return }
    const t = currentTime.value
    for (let i = lyrics.value.length - 1; i >= 0; i--) {
      if (t >= lyrics.value[i].time) { currentLyricIndex.value = i; return }
    }
    currentLyricIndex.value = -1
  }

  async function playTrack(track: Track) {
    initAudio()
    if (!audioElement) return

    const url = track.audioUrl
    if (!url) { console.error('无音频地址'); return }

    audioElement.src = url
    audioElement.currentTime = 0
    currentTime.value = 0
    currentTrack.value = track

    // 连接 Web Audio（仅首次）
    if (!audioConnected) {
      try { connectAudioElement(audioElement); audioConnected = true }
      catch { console.warn('Web Audio 不可用') }
    }

    // 获取歌词
    fetchLyrics(track.title, track.artist).then(l => { lyrics.value = l; currentLyricIndex.value = -1 })

    try {
      resumeContext()
      await audioElement.play()
    } catch (err) { console.error('播放失败:', err) }
  }

  function togglePlay() {
    if (!audioElement || !currentTrack.value) return
    if (isPlaying.value) audioElement.pause()
    else { resumeContext(); audioElement.play() }
  }

  function seek(time: number) {
    if (audioElement) { audioElement.currentTime = time; currentTime.value = time }
  }

  function setVolume(v: number) {
    volume.value = v
    if (audioElement) audioElement.volume = v
  }

  function nextTrack() {
    if (!queue.value.length) return
    let i: number
    if (playMode.value === 'shuffle') i = Math.floor(Math.random() * queue.value.length)
    else if (playMode.value === 'repeat-one') i = queueIndex.value
    else i = (queueIndex.value + 1) % queue.value.length
    queueIndex.value = i
    playTrack(queue.value[i])
  }

  function prevTrack() {
    if (!queue.value.length) return
    const i = playMode.value === 'shuffle'
      ? Math.floor(Math.random() * queue.value.length)
      : (queueIndex.value - 1 + queue.value.length) % queue.value.length
    queueIndex.value = i
    playTrack(queue.value[i])
  }

  function setQueue(tracks: Track[], startIndex = 0) {
    queue.value = tracks; queueIndex.value = startIndex
    playTrack(tracks[startIndex])
  }

  function setLyricEffect(effect: LyricEffect) { lyricEffect.value = effect }
  function toggleFullPlayer() { showFullPlayer.value = !showFullPlayer.value }

  function cyclePlayMode() {
    const modes: PlayMode[] = ['sequential', 'shuffle', 'repeat-one']
    const idx = modes.indexOf(playMode.value)
    playMode.value = modes[(idx + 1) % modes.length]
  }

  return {
    currentTrack, queue, queueIndex, isPlaying, currentTime, duration,
    volume, playMode, lyrics, currentLyricIndex, frequencyData,
    lyricEffect, showFullPlayer,
    playTrack, togglePlay, seek, setVolume, nextTrack, prevTrack,
    setQueue, setLyricEffect, toggleFullPlayer, cyclePlayMode
  }
})