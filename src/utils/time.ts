export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function parseLRC(lrcText: string): Array<{ time: number; text: string }> {
  const lines = lrcText.split('\n')
  const result: Array<{ time: number; text: string }> = []
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

  for (const line of lines) {
    const match = line.match(regex)
    if (match) {
      const m = parseInt(match[1])
      const s = parseInt(match[2])
      const ms = match[3].length === 3 ? parseInt(match[3]) : parseInt(match[3]) * 10
      const time = m * 60 + s + ms / 1000
      const text = line.replace(regex, '').trim()
      if (text) {
        result.push({ time, text })
      }
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}