// 歌曲/视频
export interface Track {
  id: string
  title: string
  artist: string
  cover: string
  duration: number
  source: 'bilibili' | 'netease' | 'qqmusic'
  cid?: number          // B站 content ID
  songId?: string       // 网易云/QQ音乐 歌曲ID
  audioUrl?: string     // 直接音频URL
}

// 搜索结果
export interface SearchResult {
  tracks: Track[]
  total: number
  source: string
}

// 歌单
export interface Playlist {
  id: string
  name: string
  tracks: Track[]
  createdAt: number
  updatedAt: number
}

// 歌词行
export interface LyricLine {
  time: number    // 秒
  text: string
}

// 弹幕
export interface DanmakuItem {
  id: string
  text: string
  time: number
  color: string
  user: string
  timestamp: number
}

// 场景主题
export type SceneType = 'wave' | 'particle' | 'aurora' | 'vinyl' | 'nebula' | 'firefly'

// 歌词动效模式
export type LyricEffect = 'scroll' | 'karaoke' | 'wave' | 'typewriter' | 'glow' | 'bounce'

// 心情模式
export type MoodType = 'happy' | 'sad' | 'calm' | 'energetic' | 'romantic' | 'melancholy' | 'random'

// 歌词显示模式
export interface LyricStyle {
  effect: LyricEffect
  fontSize: number
  color: string
  highlightColor: string
  alignment: 'left' | 'center' | 'right'
}

// 播放模式
export type PlayMode = 'sequential' | 'shuffle' | 'repeat-one'

// 心情推荐配置
export interface MoodConfig {
  mood: MoodType
  label: string
  icon: string
  emoji: string
  timeRange?: { start: number; end: number }  // 推荐时间段
  tags: string[]  // 推荐标签
}