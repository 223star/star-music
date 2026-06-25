import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SceneType, MoodType, MoodConfig } from '@/types'

export const useThemeStore = defineStore('theme', () => {
  const currentScene = ref<SceneType>('wave')
  const previousScene = ref<SceneType>('wave')
  const currentSkin = ref<'dark' | 'light'>('dark')

  // 心情配置
  const moodConfigs: MoodConfig[] = [
    { mood: 'happy', label: '开心', icon: '😊', emoji: '🎉', tags: ['流行', '电子', '轻快'], timeRange: { start: 8, end: 12 } },
    { mood: 'sad', label: '难过', icon: '😢', emoji: '💧', tags: ['伤感', '民谣', '慢歌'] },
    { mood: 'calm', label: '平静', icon: '😌', emoji: '🌊', tags: ['轻音乐', '纯音乐', '冥想'] },
    { mood: 'energetic', label: '活力', icon: '⚡', emoji: '🔥', tags: ['摇滚', '电音', '舞曲'] },
    { mood: 'romantic', label: '浪漫', icon: '🥰', emoji: '💕', tags: ['情歌', 'R&B', '爵士'] },
    { mood: 'melancholy', label: '忧郁', icon: '🌧️', emoji: '🌙', tags: ['独立', '后摇', '迷幻'] },
    { mood: 'random', label: '随机', icon: '🎲', emoji: '✨', tags: [] }
  ]

  const currentMood = ref<MoodType>('random')

  // 根据时间推荐心情
  function getTimeBasedMood(): MoodType {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 9) return 'calm'       // 早晨
    if (hour >= 9 && hour < 12) return 'happy'     // 上午
    if (hour >= 12 && hour < 14) return 'calm'     // 午休
    if (hour >= 14 && hour < 18) return 'energetic' // 下午
    if (hour >= 18 && hour < 22) return 'romantic'  // 傍晚
    return 'melancholy'                             // 夜晚
  }

  function setMood(mood: MoodType) {
    currentMood.value = mood
    // 根据心情切换场景
    const sceneMap: Record<MoodType, SceneType> = {
      happy: 'wave',
      sad: 'aurora',
      calm: 'firefly',
      energetic: 'particle',
      romantic: 'nebula',
      melancholy: 'aurora',
      random: 'wave'
    }
    setScene(sceneMap[mood])
  }

  function setScene(scene: SceneType) {
    previousScene.value = currentScene.value
    currentScene.value = scene
    document.documentElement.className = `scene-${scene}`
  }

  function randomScene() {
    const scenes: SceneType[] = ['wave', 'particle', 'aurora', 'vinyl', 'nebula', 'firefly']
    const random = scenes[Math.floor(Math.random() * scenes.length)]
    setScene(random)
  }

  function toggleSkin() {
    currentSkin.value = currentSkin.value === 'dark' ? 'light' : 'dark'
  }

  return {
    currentScene, previousScene, currentSkin,
    currentMood, moodConfigs,
    getTimeBasedMood, setMood, setScene, randomScene, toggleSkin
  }
})