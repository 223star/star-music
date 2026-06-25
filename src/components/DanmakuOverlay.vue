<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import type { DanmakuItem } from '@/types'
import { generateId } from '@/utils/time'

const player = usePlayerStore()

// 弹幕列表
const danmakuList = ref<DanmakuItem[]>([])
const danmakuInput = ref('')
const danmakuColor = ref('#ffffff')
const danmakuEnabled = ref(true)
const showInput = ref(false)

const colors = ['#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b9d', '#a855f7']

// 添加弹幕
function addDanmaku(text: string, color = '#ffffff') {
  if (!text.trim()) return
  const item: DanmakuItem = {
    id: generateId(),
    text: text.trim(),
    time: player.currentTime,
    color,
    user: '匿名用户',
    timestamp: Date.now()
  }
  danmakuList.value.push(item)

  // 限制弹幕数量
  if (danmakuList.value.length > 200) {
    danmakuList.value.splice(0, 50)
  }

  danmakuInput.value = ''
}

function sendDanmaku() {
  if (!danmakuInput.value.trim()) return
  addDanmaku(danmakuInput.value, danmakuColor.value)
}

// 清除弹幕
function clearDanmaku() {
  danmakuList.value = []
}

// 模拟弹幕（演示用）
let mockTimer: ReturnType<typeof setInterval> | null = null
const mockDanmaku = [
  '好听！', '前排打卡', '🎵🎵🎵', '循环中...', '歌词好美',
  '😭😭😭', '来了来了', '每天一遍', '太上头了', '绝绝子'
]

function startMockDanmaku() {
  if (mockTimer) return
  mockTimer = setInterval(() => {
    if (!player.isPlaying || !danmakuEnabled.value) return
    if (Math.random() > 0.3) return
    const text = mockDanmaku[Math.floor(Math.random() * mockDanmaku.length)]
    const color = colors[Math.floor(Math.random() * colors.length)]
    addDanmaku(text, color)
  }, 3000)
}

function stopMockDanmaku() {
  if (mockTimer) {
    clearInterval(mockTimer)
    mockTimer = null
  }
}

onMounted(() => {
  startMockDanmaku()
})

onUnmounted(() => {
  stopMockDanmaku()
})

watch(() => player.isPlaying, (playing) => {
  if (playing) startMockDanmaku()
  else stopMockDanmaku()
})

// 弹幕轨道
function getDanmakuStyle(item: DanmakuItem, index: number) {
  const top = 30 + (index % 15) * 28
  const duration = 8 + Math.random() * 4
  const delay = Math.random() * 2
  return {
    color: item.color,
    top: `${top}px`,
    animation: `danmaku-scroll ${duration}s linear ${delay}s`
  }
}
</script>

<template>
  <div class="danmaku-container" :class="{ hidden: !danmakuEnabled }">
    <!-- 弹幕显示区 -->
    <div class="danmaku-stage">
      <div
        v-for="(item, index) in danmakuList.slice(-50)"
        :key="item.id"
        class="danmaku-item"
        :style="getDanmakuStyle(item, index)"
      >
        {{ item.text }}
      </div>
    </div>

    <!-- 弹幕浮层控制 -->
    <div class="danmaku-controls" v-if="player.currentTrack">
      <div class="danmaku-toggle">
        <button class="toggle-btn" @click="danmakuEnabled = !danmakuEnabled">
          {{ danmakuEnabled ? '💬' : '💬' }}
        </button>
      </div>

      <Transition name="slide-up">
        <div v-if="showInput" class="danmaku-input-area">
          <div class="color-picker">
            <button
              v-for="c in colors"
              :key="c"
              :class="['color-dot', { active: danmakuColor === c }]"
              :style="{ background: c }"
              @click="danmakuColor = c"
            ></button>
          </div>
          <input
            v-model="danmakuInput"
            type="text"
            class="danmaku-input"
            placeholder="发条弹幕..."
            @keyup.enter="sendDanmaku"
          />
          <button class="send-btn" @click="sendDanmaku">发送</button>
        </div>
      </Transition>

      <button class="danmaku-trigger" @click="showInput = !showInput">
        ✏️
      </button>
    </div>
  </div>
</template>

<style scoped>
.danmaku-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 50;
  overflow: hidden;
}

.danmaku-container.hidden .danmaku-stage {
  display: none;
}

.danmaku-stage {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 100px;
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  left: 0;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  text-shadow:
    0 0 4px rgba(0,0,0,0.9),
    0 0 8px rgba(0,0,0,0.5);
  will-change: transform;
  pointer-events: none;
  animation: danmaku-scroll 10s linear;
}

@keyframes danmaku-scroll {
  from { transform: translateX(calc(100vw)); }
  to { transform: translateX(-100%); }
}

/* 控制区 */
.danmaku-controls {
  position: fixed;
  right: 16px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  pointer-events: auto;
  z-index: 51;
}

.toggle-btn, .danmaku-trigger {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-primary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover, .danmaku-trigger:hover {
  background: var(--scene-accent);
  border-color: var(--scene-accent);
}

.danmaku-input-area {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(20px);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-picker {
  display: flex;
  gap: 4px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-dot.active {
  border-color: white;
  transform: scale(1.15);
}

.danmaku-input {
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  min-width: 180px;
}

.danmaku-input:focus {
  border-color: var(--scene-accent);
}

.send-btn {
  background: var(--scene-accent);
  border: none;
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  align-self: flex-end;
}

/* 动画过渡 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>