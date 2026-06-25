<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useThemeStore } from '@/stores/theme'

const player = usePlayerStore()
const theme = useThemeStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animFrameId: number | null = null
let particles: Particle[] = []

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number
  alpha: number; life: number; maxLife: number
}

function getColors(): { primary: string; secondary: string; tertiary: string } {
  const map: Record<string, { primary: string; secondary: string; tertiary: string }> = {
    wave:     { primary: '#00d4ff', secondary: '#0088ff', tertiary: '#0044ff' },
    particle: { primary: '#ff6b9d', secondary: '#ff4081', tertiary: '#c51162' },
    aurora:   { primary: '#00ff88', secondary: '#00cc66', tertiary: '#009944' },
    vinyl:    { primary: '#ffd700', secondary: '#ffaa00', tertiary: '#ff8800' },
    nebula:   { primary: '#a855f7', secondary: '#7c3aed', tertiary: '#6d28d9' },
    firefly:  { primary: '#22d3ee', secondary: '#06b6d4', tertiary: '#0891b2' }
  }
  return map[theme.currentScene] || map.wave
}

// 波浪可视化
function drawWave(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) {
  const colors = getColors()
  const gradient = ctx.createLinearGradient(0, h / 2, 0, h)
  gradient.addColorStop(0, colors.primary + '80')
  gradient.addColorStop(0.5, colors.secondary + '40')
  gradient.addColorStop(1, 'transparent')

  ctx.beginPath()
  ctx.moveTo(0, h)

  const slice = w / data.length
  for (let i = 0; i < data.length; i++) {
    const x = i * slice
    const y = h - (data[i] / 255) * (h * 0.6)
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // 顶部线条
  ctx.beginPath()
  ctx.moveTo(0, h - (data[0] / 255) * (h * 0.6))
  for (let i = 1; i < data.length; i++) {
    const x = i * slice
    const y = h - (data[i] / 255) * (h * 0.6)
    ctx.lineTo(x, y)
  }
  ctx.strokeStyle = colors.primary
  ctx.lineWidth = 2
  ctx.shadowColor = colors.primary
  ctx.shadowBlur = 10
  ctx.stroke()
  ctx.shadowBlur = 0
}

// 粒子可视化
function drawParticles(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) {
  const colors = getColors()
  const avgFreq = data.reduce((a, b) => a + b, 0) / data.length / 255

  // 根据频率产生新粒子
  if (avgFreq > 0.1 && Math.random() < avgFreq * 0.5) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * w * 0.5,
      y: h,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - avgFreq * 5,
      size: Math.random() * 4 + 2,
      alpha: 1,
      life: 0,
      maxLife: 60 + Math.random() * 40
    })
  }

  // 更新和绘制粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy -= 0.02  // 上升加速
    p.life++
    p.alpha = 1 - p.life / p.maxLife

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = colors.primary + Math.floor(p.alpha * 200).toString(16).padStart(2, '0')
    ctx.fill()

    // 发光效果
    ctx.shadowColor = colors.primary
    ctx.shadowBlur = 15 * p.alpha
    ctx.fill()
    ctx.shadowBlur = 0

    if (p.life > p.maxLife) particles.splice(i, 1)
  }
}

// 极光可视化
function drawAurora(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) {
  const colors = getColors()
  const time = Date.now() * 0.001

  for (let band = 0; band < 3; band++) {
    ctx.beginPath()
    const offsetY = h * 0.3 + band * 30
    for (let x = 0; x <= w; x += 4) {
      const dataIdx = Math.floor((x / w) * data.length)
      const freq = data[dataIdx] / 255 || 0
      const y = offsetY + Math.sin(x * 0.01 + time + band) * (20 + freq * 40) + Math.sin(x * 0.02 + time * 0.7 + band * 2) * 10
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()

    const alpha = 0.1 + band * 0.05
    const hex = Math.floor(alpha * 255).toString(16).padStart(2, '0')
    const colors_list = [colors.primary + hex, colors.secondary + hex, colors.tertiary + hex]
    ctx.fillStyle = colors_list[band]
    ctx.fill()
  }
}

function drawScene(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)

  switch (theme.currentScene) {
    case 'wave':
    case 'vinyl':
    case 'nebula':
      drawWave(ctx, data, w, h)
      break
    case 'particle':
    case 'firefly':
      drawParticles(ctx, data, w, h)
      break
    case 'aurora':
      drawAurora(ctx, data, w, h)
      break
    default:
      drawWave(ctx, data, w, h)
  }
}

let lastFrame = 0
function animate(timestamp: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 限制帧率
  if (timestamp - lastFrame < 30) {
    animFrameId = requestAnimationFrame(animate)
    return
  }
  lastFrame = timestamp

  const w = canvas.width
  const h = canvas.height
  const data = player.frequencyData

  if (player.isPlaying) {
    drawScene(ctx, data, w, h)
  } else {
    // 无播放时显示静态装饰
    ctx.clearRect(0, 0, w, h)
    if (particles.length > 0) {
      particles = particles.filter(p => p.life < p.maxLife)
      for (const p of particles) {
        p.life += 2
        p.alpha = 1 - p.life / p.maxLife
        if (p.alpha <= 0) continue
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${Math.max(0, p.alpha * 0.3)})`
        ctx.fill()
      }
    }
  }

  animFrameId = requestAnimationFrame(animate)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !canvas.parentElement) return
  canvas.width = canvas.parentElement.clientWidth
  canvas.height = canvas.parentElement.clientHeight
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  animate(0)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <canvas ref="canvasRef" class="audio-visualizer"></canvas>
</template>

<style scoped>
.audio-visualizer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>